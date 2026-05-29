import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { Minimatch } from "minimatch";

const MATCH_OPTS = { dot: true, nocase: false, nocomment: true };
const MATCH_OPTS_BASE = { ...MATCH_OPTS, matchBase: true };
const STATIC_IGNORES = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
];

/**
 * Compiled-pattern cache. `isIgnored` is called once per file, and each call
 * tests the path against every ignore rule (200+ in a large monorepo). The
 * top-level `minimatch()` helper recompiles the pattern's regex AST on every
 * call, making ignore-matching O(files × rules × compile) — a major contributor
 * to the full-tree validation hang. Caching the compiled Minimatch per
 * (pattern, matchBase) reduces matching to an O(1) regex test. Behavior is
 * unchanged: `new Minimatch(p, opts).match(s)` is what `minimatch(s, p, opts)`
 * does internally.
 */
const compiledIgnoreCache = new Map<string, Minimatch>();

function ignoreMatch(
  value: string,
  pattern: string,
  matchBase = false,
): boolean {
  const key = (matchBase ? "b:" : "n:") + pattern;
  let mm = compiledIgnoreCache.get(key);
  if (!mm) {
    mm = new Minimatch(pattern, matchBase ? MATCH_OPTS_BASE : MATCH_OPTS);
    compiledIgnoreCache.set(key, mm);
  }
  return mm.match(value);
}

interface IgnoreRule {
  base: string;
  pattern: string;
  negated: boolean;
  directoryOnly: boolean;
  hasSlash: boolean;
}

function normalize(value: string): string {
  return value
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/+$/, "");
}

function parseIgnoreLine(line: string): IgnoreRule | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  let raw = trimmed;
  let negated = false;
  if (raw.startsWith("!")) {
    negated = true;
    raw = raw.slice(1).trim();
  }

  if (!raw) {
    return null;
  }

  const directoryOnly = raw.endsWith("/");
  let pattern = directoryOnly ? raw.slice(0, -1) : raw;
  pattern = pattern.replace(/^\/+/, "");
  if (!pattern) {
    return null;
  }

  return {
    base: ".",
    pattern,
    negated,
    directoryOnly,
    hasSlash: pattern.includes("/"),
  };
}

function toLocalPath(base: string, relativePath: string): string | null {
  if (base === ".") {
    return relativePath;
  }
  if (relativePath === base) {
    return "";
  }
  if (relativePath.startsWith(`${base}/`)) {
    return relativePath.slice(base.length + 1);
  }
  return null;
}

function matchesRule(localPath: string, rule: IgnoreRule): boolean {
  if (rule.directoryOnly) {
    const directoryPattern = normalize(rule.pattern);
    if (!directoryPattern) {
      return false;
    }
    return (
      localPath === directoryPattern ||
      ignoreMatch(localPath, `${directoryPattern}/**`)
    );
  }

  if (rule.hasSlash) {
    return ignoreMatch(localPath, rule.pattern);
  }

  return (
    ignoreMatch(localPath, rule.pattern, true) ||
    ignoreMatch(localPath, `**/${rule.pattern}`)
  );
}

function collectIgnoreRules(repoRoot: string): IgnoreRule[] {
  const root = path.resolve(repoRoot);
  const ignoreFiles = globSync("**/.*ignore*", {
    cwd: root,
    absolute: true,
    nodir: true,
    dot: true,
    ignore: STATIC_IGNORES,
  }).sort((a, b) => {
    const depthDiff =
      normalize(path.relative(root, path.dirname(a))).split("/").length -
      normalize(path.relative(root, path.dirname(b))).split("/").length;
    return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
  });

  const rules: IgnoreRule[] = [];
  for (const ignoreFile of ignoreFiles) {
    const dirRel =
      normalize(path.relative(root, path.dirname(ignoreFile))) || ".";
    const lines = fs.readFileSync(ignoreFile, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseIgnoreLine(line);
      if (!parsed) {
        continue;
      }
      rules.push({
        ...parsed,
        base: dirRel,
      });
    }
  }

  return rules;
}

export interface IgnoreMatcher {
  isIgnored(absolutePath: string): boolean;
}

export function createIgnoreMatcher(repoRoot: string): IgnoreMatcher {
  const root = path.resolve(repoRoot);
  const rules = collectIgnoreRules(root);

  return {
    isIgnored(absolutePath: string): boolean {
      const rel = normalize(path.relative(root, path.resolve(absolutePath)));
      if (!rel || rel.startsWith("..")) {
        return false;
      }

      let ignored = false;
      for (const rule of rules) {
        const localPath = toLocalPath(rule.base, rel);
        if (localPath === null) {
          continue;
        }
        if (matchesRule(localPath, rule)) {
          ignored = !rule.negated;
        }
      }
      return ignored;
    },
  };
}

export function getStaticIgnoreGlobs(): string[] {
  return [...STATIC_IGNORES];
}
