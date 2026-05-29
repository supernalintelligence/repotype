import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { minimatch } from "minimatch";
import { describe, expect, it } from "vitest";
import { matchesGlob } from "../src/core/glob.js";
import { createIgnoreMatcher } from "../src/core/path-ignore.js";
import {
  scanFiles,
  ValidationEngine,
} from "../src/core/validator-framework.js";
import { validatePath } from "../src/cli/use-cases.js";

/**
 * Regression suite for the full-tree validation HANG.
 *
 * Root cause: `matchesGlob` / ignore-matching used the top-level `minimatch()`
 * helper, which recompiled the glob's regex AST on EVERY call. With one call per
 * (file × rule), a repo-wide run paid O(files × rules) glob compilations —
 * millions of recompilations — turning full-tree validation into a multi-minute
 * CPU hang. The fix caches compiled Minimatch instances per pattern.
 *
 * These tests pin the two invariants that prevent silent regression:
 *  1. The compiled-pattern cache is behavior-preserving (same result as a fresh
 *     `minimatch()` call) and matching is bounded even under heavy repetition.
 *  2. Full-tree scan + validate terminates and never recurses into excluded
 *     build/VCS directories (node_modules, .git, dist, build).
 */

function makeBigTree(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "repotype-fulltree-"));

  fs.writeFileSync(
    path.join(root, "repotype.yaml"),
    [
      'version: "1.0"',
      "defaults:",
      "  unmatchedFiles: allow",
      "files:",
      // A handful of glob-bearing rules so resolveEffectiveRules exercises the
      // per-(file × rule) match path that the cache must keep cheap.
      "  - id: md\n    glob: '**/*.md'\n    requiredSections: ['Overview']",
      "  - id: ts\n    glob: '**/*.ts'",
      "  - id: json\n    glob: '**/*.json'",
      "  - id: docs\n    glob: 'docs/**/*.md'",
      "  - id: src\n    glob: 'src/**/*.ts'",
    ].join("\n") + "\n",
  );

  // Real, in-scope content the scanner SHOULD find.
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  for (let i = 0; i < 400; i++) {
    fs.writeFileSync(
      path.join(root, "docs", `doc-${i}.md`),
      `# Title ${i}\n\nbody\n`,
    );
    fs.writeFileSync(
      path.join(root, "src", `mod-${i}.ts`),
      `export const x${i} = ${i};\n`,
    );
  }

  // Excluded directories that MUST NOT be walked. We stuff them with many files
  // so a regression that recurses into them would blow up the scan count (and
  // time). The hard-static ignores must exclude these before enumeration.
  for (const excluded of ["node_modules", ".git", "dist", "build"]) {
    const dir = path.join(root, excluded, "deep", "nested");
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < 500; i++) {
      fs.writeFileSync(path.join(dir, `junk-${i}.md`), `# junk ${i}\n`);
      fs.writeFileSync(path.join(dir, `junk-${i}.ts`), `junk${i}\n`);
    }
  }

  return root;
}

describe("full-tree validation termination (glob-compile cache regression)", () => {
  it("matchesGlob is behavior-equivalent to a fresh minimatch call", () => {
    const cases: Array<[string, string, boolean]> = [
      ["docs/a.md", "**/*.md", true],
      ["docs/a.md", "docs/**/*.md", true],
      ["src/a.ts", "**/*.md", false],
      ["a.ts", "src/**/*.ts", false],
      ["src/deep/a.ts", "src/**/*.ts", true],
      [".hidden/x.md", "**/*.md", true], // dot: true
    ];
    for (const [p, glob, expected] of cases) {
      // Fresh, un-cached reference (recompiles every time).
      const reference = minimatch(p, glob, {
        dot: true,
        nocase: false,
        nocomment: true,
      });
      expect(reference).toBe(expected);
      // Cached path must agree, and must be stable across repeated calls.
      expect(matchesGlob(p, glob)).toBe(expected);
      expect(matchesGlob(p, glob)).toBe(expected);
    }
  });

  it("heavy repeated matching stays bounded (cache prevents per-call recompile)", () => {
    const patterns = [
      "**/*.md",
      "**/*.ts",
      "docs/**/*.md",
      "src/**/*.ts",
      "**/*.json",
    ];
    const paths = Array.from({ length: 2000 }, (_, i) =>
      i % 2 === 0 ? `docs/d-${i}.md` : `src/s-${i}.ts`,
    );
    const start = Date.now();
    let matched = 0;
    // 2000 paths × 5 patterns = 10k matches; without the cache each is a fresh
    // regex compile. Cached, this is trivially fast.
    for (const p of paths) {
      for (const glob of patterns) {
        if (matchesGlob(p, glob)) matched++;
      }
    }
    const elapsedMs = Date.now() - start;
    expect(matched).toBeGreaterThan(0);
    // Generous ceiling — the point is it must not be pathological. Compiling 10k
    // times took multiple seconds pre-fix; cached it is well under this bound.
    expect(elapsedMs).toBeLessThan(2000);
  });

  it("scanFiles never recurses into node_modules/.git/dist/build", () => {
    const root = makeBigTree();
    try {
      const matcher = createIgnoreMatcher(root);
      const files = scanFiles(root, root, matcher);
      // Should find the ~800 real docs/src files, not the 4000 junk files.
      expect(files.length).toBeGreaterThan(700);
      expect(files.length).toBeLessThan(1000);
      const leaked = files.filter((f) =>
        /(^|\/)(node_modules|\.git|dist|build)(\/|$)/.test(
          path.relative(root, f),
        ),
      );
      expect(leaked).toEqual([]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("full-tree validate terminates in bounded time over a large tree", async () => {
    const root = makeBigTree();
    try {
      const start = Date.now();
      const result = await validatePath(root, undefined, { noCache: true });
      const elapsedMs = Date.now() - start;

      // It must actually scan the real in-scope files (not bail at zero) and not
      // have walked the excluded dirs.
      const scanned =
        result.mode === "workspace"
          ? result.result.filesScanned
          : result.result.filesScanned;
      expect(scanned).toBeGreaterThan(700);
      expect(scanned).toBeLessThan(1000);

      // Termination guard: a regression to per-call glob recompilation made this
      // take minutes. With the cache it completes in a couple of seconds; the
      // bound is deliberately loose to stay stable across CI machines.
      expect(elapsedMs).toBeLessThan(30_000);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);
});
