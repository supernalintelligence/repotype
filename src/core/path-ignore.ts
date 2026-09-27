import fs from "node:fs";
import path from "node:path";
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

const STATIC_IGNORE_DIR_NAMES = new Set(["node_modules", ".git", "dist", "build"]);
const IGNORE_FILE_RE = /^\..*ignore/;

function matchesAnyRule(rel: string, rules: IgnoreRule[]): boolean {
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
}

/**
 * Reads ignore files level by level and never descends into a directory the
 * rules found so far already ignore, the same pruning git applies. An unpruned
 * `**` walk enumerated every ignored tree on every call (a checkout's
 * `.worktrees/` holds 100+ full repo copies), which made a one-file validation
 * take minutes.
 */
function collectIgnoreRules(repoRoot: string): {
  rules: IgnoreRule[];
  ignoreFiles: string[];
} {
  const root = path.resolve(repoRoot);
  const rules: IgnoreRule[] = [];
  const ignoreFiles: string[] = [];
  let level = [root];

  while (level.length > 0) {
    level.sort((a, b) => a.localeCompare(b));
    const next: string[] = [];
    const levelDirents = level.map((dir) => ({
      dir,
      entries: fs.readdirSync(dir, { withFileTypes: true }),
    }));

    for (const { dir, entries } of levelDirents) {
      const dirRel = normalize(path.relative(root, dir)) || ".";
      const names = entries
        .filter((e) => e.isFile() && IGNORE_FILE_RE.test(e.name))
        .map((e) => e.name)
        .sort();
      for (const name of names) {
        const ignoreFile = path.join(dir, name);
        ignoreFiles.push(ignoreFile);
        for (const line of fs.readFileSync(ignoreFile, "utf8").split(/\r?\n/)) {
          const parsed = parseIgnoreLine(line);
          if (parsed) {
            rules.push({ ...parsed, base: dirRel });
          }
        }
      }
    }

    for (const { dir, entries } of levelDirents) {
      for (const entry of entries) {
        if (!entry.isDirectory() || STATIC_IGNORE_DIR_NAMES.has(entry.name)) {
          continue;
        }
        const child = path.join(dir, entry.name);
        if (!matchesAnyRule(normalize(path.relative(root, child)), rules)) {
          next.push(child);
        }
      }
    }
    level = next;
  }

  return { rules, ignoreFiles };
}

export interface IgnoreMatcher {
  isIgnored(absolutePath: string): boolean;
  /** Every ignore file read, in the order its rules were applied. */
  readonly ignoreFiles: readonly string[];
  /** A glob `ignore` option that prunes ignored and static-ignored directories. */
  readonly globIgnore: {
    ignored(p: { fullpath(): string }): boolean;
    childrenIgnored(p: { name: string; fullpath(): string }): boolean;
  };
}

export function createIgnoreMatcher(repoRoot: string): IgnoreMatcher {
  const root = path.resolve(repoRoot);
  const { rules, ignoreFiles } = collectIgnoreRules(root);

  const isIgnored = (absolutePath: string): boolean => {
    const rel = normalize(path.relative(root, path.resolve(absolutePath)));
    if (!rel || rel.startsWith("..")) {
      return false;
    }
    // As in git, a path inside an ignored directory is ignored too.
    const segments = rel.split("/");
    for (let i = 1; i < segments.length; i++) {
      if (matchesAnyRule(segments.slice(0, i).join("/"), rules)) {
        return true;
      }
    }
    return matchesAnyRule(rel, rules);
  };

  return {
    isIgnored,
    ignoreFiles,
    globIgnore: {
      ignored: () => false,
      childrenIgnored: (p) =>
        STATIC_IGNORE_DIR_NAMES.has(p.name) || isIgnored(p.fullpath()),
    },
  };
}

export function getStaticIgnoreGlobs(): string[] {
  return [...STATIC_IGNORES];
}
