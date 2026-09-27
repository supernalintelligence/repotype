import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createIgnoreMatcher } from "../src/core/path-ignore.js";
import { createDefaultEngine } from "../src/cli/runtime.js";

function makeRepo(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "repotype-prune-"));
  fs.writeFileSync(
    path.join(root, "repotype.yaml"),
    [
      'version: "1"',
      "defaults:",
      "  unmatchedFiles: allow",
      "files:",
      "  - id: md",
      '    glob: "docs/*.md"',
      "    requiredSections: [Overview]",
      "",
    ].join("\n"),
  );
  fs.writeFileSync(path.join(root, ".gitignore"), ".worktrees\nscratch/\n");
  fs.mkdirSync(path.join(root, "docs"));
  fs.writeFileSync(path.join(root, "docs", "good.md"), "# T\n\n## Overview\n");
  fs.writeFileSync(path.join(root, "docs", "bad.md"), "# T\n\n## Other\n");
  fs.mkdirSync(path.join(root, "sub"));
  fs.writeFileSync(path.join(root, "sub", ".gitignore"), "tmp/\n");
  // An ignored copy of the repo, as `.worktrees/` holds in a real checkout.
  const copy = path.join(root, ".worktrees", "wt1");
  fs.mkdirSync(path.join(copy, "nested"), { recursive: true });
  fs.writeFileSync(path.join(copy, ".gitignore"), "!keep\n");
  fs.writeFileSync(path.join(copy, "nested", ".gitignore"), "x\n");
  return root;
}

describe("ignore-rule collection prunes ignored directories", () => {
  it("never reads ignore files inside an ignored directory", () => {
    const root = makeRepo();
    const matcher = createIgnoreMatcher(root);
    const rel = matcher.ignoreFiles.map((f) => path.relative(root, f));
    expect(rel).toEqual([".gitignore", path.join("sub", ".gitignore")]);
    expect(matcher.isIgnored(path.join(root, ".worktrees", "wt1", "keep"))).toBe(
      true,
    );
    expect(matcher.isIgnored(path.join(root, "sub", "tmp", "a"))).toBe(true);
    expect(matcher.isIgnored(path.join(root, "docs", "good.md"))).toBe(false);
  });

  it("does not descend into an ignored directory at all", () => {
    const root = makeRepo();
    const blocked = path.join(root, ".worktrees", "wt1", "nested");
    fs.chmodSync(blocked, 0o000);
    try {
      expect(() => createIgnoreMatcher(root)).not.toThrow();
    } finally {
      fs.chmodSync(blocked, 0o755);
    }
  });
});

describe("file-target validation", () => {
  it("validates only the named file, not every .gitignore in the repo", async () => {
    const root = makeRepo();
    const result = await createDefaultEngine().validate(
      path.join(root, "docs", "good.md"),
      { configPath: path.join(root, "repotype.yaml") },
    );
    expect(result.filesScanned).toBe(1);
  });

  it("validateFiles reports the same per-file findings as one call per file", async () => {
    const root = makeRepo();
    const configPath = path.join(root, "repotype.yaml");
    const files = [
      path.join(root, "docs", "good.md"),
      path.join(root, "docs", "bad.md"),
    ];
    const key = (d: { code?: string; file: string }) => `${d.code} ${d.file}`;
    const single = new Set<string>();
    for (const file of files) {
      const r = await createDefaultEngine().validate(file, { configPath });
      for (const d of r.diagnostics) single.add(key(d));
    }
    const batch = await createDefaultEngine().validateFiles(files, {
      configPath,
    });
    expect(new Set(batch.diagnostics.map(key))).toEqual(single);
    expect(batch.filesScanned).toBe(2);
    expect(
      batch.diagnostics.some(
        (d) => d.code === "missing_section" && d.file.endsWith("bad.md"),
      ),
    ).toBe(true);
  });

  it("validateFiles rejects a missing file instead of skipping it", async () => {
    const root = makeRepo();
    await expect(
      createDefaultEngine().validateFiles([path.join(root, "nope.md")], {
        configPath: path.join(root, "repotype.yaml"),
      }),
    ).rejects.toThrow(/not an existing file/);
  });
});
