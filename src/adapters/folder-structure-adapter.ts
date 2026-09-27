import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { matchesGlob } from "../core/glob.js";
import type { IgnoreMatcher } from "../core/path-ignore.js";
import type {
  Diagnostic,
  FolderRule,
  ValidatorAdapter,
  ValidatorContext,
} from "../core/types.js";

function hasGlobChars(value: string): boolean {
  return /[*?[\]{}()!+@]/.test(value);
}

/**
 * A FolderRule's target directory is "in scope" for the current validation run
 * only when it lies on the same path lineage as the validation target: the rule
 * target is equal to, an ancestor of, or a descendant of the target. Disjoint
 * subtrees are out of scope — e.g. a board-structure rule on `packages/boards/x`
 * has zero scanned files under a `.supernal/docs` run, so firing it would leak
 * out-of-target errors. A full-tree run (target == repoRoot) puts every rule in
 * scope, so the platform-wide debt is still caught.
 */
function isWithinTargetScope(
  ruleTargetDir: string,
  targetRoot: string,
): boolean {
  const rel = path.relative(targetRoot, ruleTargetDir);
  // rule target is the validation target or under it
  const targetIsAncestorOrEqual =
    rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
  if (targetIsAncestorOrEqual) return true;
  // validation target is under the rule target (rule is an ancestor)
  const relInverse = path.relative(ruleTargetDir, targetRoot);
  return (
    relInverse !== "" &&
    !relInverse.startsWith("..") &&
    !path.isAbsolute(relInverse)
  );
}

function matchesAny(name: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesGlob(name, pattern));
}

// Glob matches depend only on the repo and its ignore rules, so one run
// (one IgnoreMatcher) computes each rule glob once, whatever the target count.
const globTargetCache = new WeakMap<IgnoreMatcher, Map<string, string[]>>();

function collectTargetDirectories(
  rule: FolderRule,
  repoRoot: string,
  ignoreMatcher: IgnoreMatcher,
): string[] {
  if (rule.path) {
    const resolved = path.resolve(repoRoot, rule.path);
    return ignoreMatcher.isIgnored(resolved) ? [] : [resolved];
  }
  if (rule.glob) {
    let perRun = globTargetCache.get(ignoreMatcher);
    if (!perRun) {
      perRun = new Map();
      globTargetCache.set(ignoreMatcher, perRun);
    }
    const key = `${repoRoot}\0${rule.glob}`;
    const cached = perRun.get(key);
    if (cached) return cached;
    const matched = globSync(rule.glob, {
      cwd: repoRoot,
      absolute: true,
      nodir: false,
      dot: true,
      ignore: ignoreMatcher.globIgnore,
    });
    const dirs = matched.filter(
      (entry) =>
        !ignoreMatcher.isIgnored(entry) &&
        fs.existsSync(entry) &&
        fs.statSync(entry).isDirectory(),
    );
    perRun.set(key, dirs);
    return dirs;
  }
  return [];
}

function checkRequiredFolders(
  dirPath: string,
  rule: FolderRule,
  childFolders: string[],
  diagnostics: Diagnostic[],
): void {
  for (const required of rule.requiredFolders || []) {
    if (hasGlobChars(required)) {
      if (!childFolders.some((child) => matchesGlob(child, required))) {
        diagnostics.push({
          code: "required_folder_missing",
          message: `Missing required child folder pattern '${required}' under '${dirPath}'`,
          severity: "error",
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: "Create the expected folder or update requiredFolders in repotype.yaml.",
          },
        });
      }
      continue;
    }

    if (!childFolders.includes(required)) {
      diagnostics.push({
        code: "required_folder_missing",
        message: `Missing required child folder '${required}' under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: "Create the folder or update requiredFolders in repotype.yaml.",
        },
      });
    }
  }
}

function checkRequiredFiles(
  dirPath: string,
  rule: FolderRule,
  childFiles: string[],
  diagnostics: Diagnostic[],
): void {
  for (const required of rule.requiredFiles || []) {
    if (hasGlobChars(required)) {
      if (!childFiles.some((child) => matchesGlob(child, required))) {
        diagnostics.push({
          code: "required_file_missing",
          message: `Missing required file pattern '${required}' under '${dirPath}'`,
          severity: "error",
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: "Add the required file or update requiredFiles in repotype.yaml.",
          },
        });
      }
      continue;
    }

    if (!childFiles.includes(required)) {
      diagnostics.push({
        code: "required_file_missing",
        message: `Missing required file '${required}' under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: "Add the file or update requiredFiles in repotype.yaml.",
        },
      });
    }
  }
}

function checkAllowedFolders(
  dirPath: string,
  rule: FolderRule,
  childFolders: string[],
  diagnostics: Diagnostic[],
): void {
  if (!rule.allowedFolders || rule.allowedFolders.length === 0) {
    return;
  }
  for (const child of childFolders) {
    if (!matchesAny(child, rule.allowedFolders)) {
      diagnostics.push({
        code: "disallowed_child_folder",
        message: `Child folder '${child}' is not allowed under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFolders: rule.allowedFolders,
          hint: "Move/remove this folder or expand allowedFolders in repotype.yaml.",
        },
      });
    }
  }
}

function checkAllowedFiles(
  dirPath: string,
  rule: FolderRule,
  childFiles: string[],
  diagnostics: Diagnostic[],
): void {
  if (!rule.allowedFiles || rule.allowedFiles.length === 0) {
    return;
  }
  for (const child of childFiles) {
    if (!matchesAny(child, rule.allowedFiles)) {
      diagnostics.push({
        code: "disallowed_child_file",
        message: `Child file '${child}' is not allowed under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFiles: rule.allowedFiles,
          hint: "Move/remove this file or expand allowedFiles in repotype.yaml.",
        },
      });
    }
  }
}

export class FolderStructureAdapter implements ValidatorAdapter {
  id = "folder-structure";
  // Folder rules are file-independent, so they are evaluated once per
  // (targetRoot, repoRoot) pair rather than per scanned file. Keying on
  // targetRoot is required because the same adapter instance is shared across
  // multiple validate() calls (workspace mode validates each subtree) — a plain
  // boolean would evaluate folder rules for only the first subtree.
  private evaluatedScopes = new Set<string>();

  supports(_filePath: string, context: ValidatorContext): boolean {
    return (context.config.folders || []).length > 0;
  }

  async validate(
    _filePath: string,
    context: ValidatorContext,
  ): Promise<Diagnostic[]> {
    const scopeKey = `${context.repoRoot}\0${context.targetRoot}`;
    if (this.evaluatedScopes.has(scopeKey)) {
      return [];
    }
    this.evaluatedScopes.add(scopeKey);

    const diagnostics: Diagnostic[] = [];
    const folderRules = context.config.folders || [];
    const ignoreMatcher = context.ignoreMatcher;

    for (const rule of folderRules) {
      // Scope rules to the validation target. A path rule whose nominal target
      // is in a disjoint subtree from the validation target is skipped silently —
      // it would otherwise leak out-of-target errors (e.g. board-structure rules
      // firing during a `.supernal/docs` run). A full-tree run (target ==
      // repoRoot) keeps every rule in scope. Glob rules are scoped per-target
      // dir below.
      if (rule.path) {
        const nominalTarget = path.resolve(context.repoRoot, rule.path);
        if (!isWithinTargetScope(nominalTarget, context.targetRoot)) {
          continue;
        }
      }

      const collected = collectTargetDirectories(
        rule,
        context.repoRoot,
        ignoreMatcher,
      );
      // For glob rules, drop matched dirs outside the validation target's lineage.
      const targets = rule.glob
        ? collected.filter((dir) =>
            isWithinTargetScope(dir, context.targetRoot),
          )
        : collected;

      // Glob rule matched dirs but all were out of target scope — skip silently
      // (no targets diagnostic) since the rule simply doesn't apply to this run.
      if (rule.glob && collected.length > 0 && targets.length === 0) {
        continue;
      }

      if (rule.path && targets.length === 1 && !fs.existsSync(targets[0])) {
        diagnostics.push({
          code: "folder_rule_path_missing",
          message: `Folder rule target path does not exist: ${rule.path}`,
          severity: "error",
          file: path.resolve(context.repoRoot, rule.path),
          ruleId: rule.id,
          details: {
            hint: "Create this folder or update the folder rule path in repotype.yaml.",
          },
        });
        continue;
      }

      if (targets.length === 0) {
        diagnostics.push({
          code: "folder_rule_no_targets",
          message: `Folder rule '${rule.id || rule.path || rule.glob}' matched no directories`,
          severity: "suggestion",
          file: context.configPath,
          ruleId: rule.id,
          details: {
            hint: "Adjust path/glob so the rule applies to actual directories.",
          },
        });
        continue;
      }

      for (const targetDir of targets) {
        if (
          !fs.existsSync(targetDir) ||
          !fs.statSync(targetDir).isDirectory()
        ) {
          continue;
        }

        const entries = fs
          .readdirSync(targetDir, { withFileTypes: true })
          .filter(
            (entry) =>
              !ignoreMatcher.isIgnored(path.join(targetDir, entry.name)),
          );
        const childFolders = entries
          .filter((e) => e.isDirectory())
          .map((e) => e.name);
        const childFiles = entries.filter((e) => e.isFile()).map((e) => e.name);

        checkRequiredFolders(targetDir, rule, childFolders, diagnostics);
        checkRequiredFiles(targetDir, rule, childFiles, diagnostics);
        checkAllowedFolders(targetDir, rule, childFolders, diagnostics);
        checkAllowedFiles(targetDir, rule, childFiles, diagnostics);
      }
    }

    return diagnostics;
  }
}
