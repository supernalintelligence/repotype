import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { matchesGlob } from '../core/glob.js';
import { createIgnoreMatcher, getStaticIgnoreGlobs, type IgnoreMatcher } from '../core/path-ignore.js';
import type { Diagnostic, FolderRule, ValidatorAdapter, ValidatorContext } from '../core/types.js';

function hasGlobChars(value: string): boolean {
  return /[*?[\]{}()!+@]/.test(value);
}

function matchesAny(name: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesGlob(name, pattern));
}

function collectTargetDirectories(rule: FolderRule, repoRoot: string, ignoreMatcher: IgnoreMatcher): string[] {
  if (rule.path) {
    const resolved = path.resolve(repoRoot, rule.path);
    return ignoreMatcher.isIgnored(resolved) ? [] : [resolved];
  }
  if (rule.glob) {
    const matched = globSync(rule.glob, {
      cwd: repoRoot,
      absolute: true,
      nodir: false,
      dot: true,
      ignore: getStaticIgnoreGlobs(),
    });
    return matched.filter(
      (entry) =>
        !ignoreMatcher.isIgnored(entry) &&
        fs.existsSync(entry) &&
        fs.statSync(entry).isDirectory(),
    );
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
          code: 'required_folder_missing',
          message: `Missing required child folder pattern '${required}' under '${dirPath}'`,
          severity: 'error',
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: 'Create the expected folder or update requiredFolders in repotype.yaml.',
          },
        });
      }
      continue;
    }

    if (!childFolders.includes(required)) {
      diagnostics.push({
        code: 'required_folder_missing',
        message: `Missing required child folder '${required}' under '${dirPath}'`,
        severity: 'error',
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: 'Create the folder or update requiredFolders in repotype.yaml.',
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
          code: 'required_file_missing',
          message: `Missing required file pattern '${required}' under '${dirPath}'`,
          severity: 'error',
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: 'Add the required file or update requiredFiles in repotype.yaml.',
          },
        });
      }
      continue;
    }

    if (!childFiles.includes(required)) {
      diagnostics.push({
        code: 'required_file_missing',
        message: `Missing required file '${required}' under '${dirPath}'`,
        severity: 'error',
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: 'Add the file or update requiredFiles in repotype.yaml.',
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
        code: 'disallowed_child_folder',
        message: `Child folder '${child}' is not allowed under '${dirPath}'`,
        severity: 'error',
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFolders: rule.allowedFolders,
          hint: 'Move/remove this folder or expand allowedFolders in repotype.yaml.',
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
        code: 'disallowed_child_file',
        message: `Child file '${child}' is not allowed under '${dirPath}'`,
        severity: 'error',
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFiles: rule.allowedFiles,
          hint: 'Move/remove this file or expand allowedFiles in repotype.yaml.',
        },
      });
    }
  }
}

export class FolderStructureAdapter implements ValidatorAdapter {
  id = 'folder-structure';
  private evaluated = false;

  supports(_filePath: string, context: ValidatorContext): boolean {
    return (context.config.folders || []).length > 0;
  }

  async validate(_filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    if (this.evaluated) {
      return [];
    }
    this.evaluated = true;

    const diagnostics: Diagnostic[] = [];
    const folderRules = context.config.folders || [];
    const ignoreMatcher = createIgnoreMatcher(context.repoRoot);

    for (const rule of folderRules) {
      const targets = collectTargetDirectories(rule, context.repoRoot, ignoreMatcher);

      if (rule.path && targets.length === 1 && !fs.existsSync(targets[0])) {
        diagnostics.push({
          code: 'folder_rule_path_missing',
          message: `Folder rule target path does not exist: ${rule.path}`,
          severity: 'error',
          file: path.resolve(context.repoRoot, rule.path),
          ruleId: rule.id,
          details: {
            hint: 'Create this folder or update the folder rule path in repotype.yaml.',
          },
        });
        continue;
      }

      if (targets.length === 0) {
        diagnostics.push({
          code: 'folder_rule_no_targets',
          message: `Folder rule '${rule.id || rule.path || rule.glob}' matched no directories`,
          severity: 'suggestion',
          file: context.configPath,
          ruleId: rule.id,
          details: {
            hint: 'Adjust path/glob so the rule applies to actual directories.',
          },
        });
        continue;
      }

      for (const targetDir of targets) {
        if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
          continue;
        }

        const entries = fs
          .readdirSync(targetDir, { withFileTypes: true })
          .filter((entry) => !ignoreMatcher.isIgnored(path.join(targetDir, entry.name)));
        const childFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
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
