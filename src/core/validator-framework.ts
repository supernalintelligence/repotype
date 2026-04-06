import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { globSync } from 'glob';
import {
  findConfig,
  loadConfig,
  discoverWorkspaces,
  hashConfigFiles,
  loadWorkspaceCache,
  writeWorkspaceCache,
  resolveOwningWorkspace,
} from './config-loader.js';
import { createIgnoreMatcher, getStaticIgnoreGlobs } from './path-ignore.js';
import type { IgnoreMatcher } from './path-ignore.js';
import { resolveEffectiveRules } from './rule-engine.js';
import type {
  Diagnostic,
  RepoSchemaConfig,
  ValidationResult,
  ValidateResult,
  ValidatorAdapter,
  ValidatorContext,
  WorkspaceConflict,
  WorkspaceEntry,
  WorkspaceValidationResult,
} from './types.js';

/** Config filenames excluded from scanning — they govern, not are governed. */
const CONFIG_FILE_NAMES = new Set(['repotype.yaml', 'repo-schema.yaml']);

export function scanFiles(targetPath: string, repoRoot: string, sharedIgnoreMatcher?: IgnoreMatcher): string[] {
  const ignoreMatcher = sharedIgnoreMatcher ?? createIgnoreMatcher(repoRoot);
  const stats = fs.statSync(targetPath);
  if (stats.isFile()) {
    const absoluteFile = path.resolve(targetPath);
    if (CONFIG_FILE_NAMES.has(path.basename(absoluteFile))) return [];
    return ignoreMatcher.isIgnored(absoluteFile) ? [] : [absoluteFile];
  }

  const files = globSync('**/*', {
    cwd: targetPath,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs(),
  });
  return files.filter((filePath) => {
    if (CONFIG_FILE_NAMES.has(path.basename(filePath))) return false;
    return !ignoreMatcher.isIgnored(filePath);
  });
}

/** Simple semaphore for capping concurrency without adding a dependency. */
function createSemaphore(concurrency: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  function next() {
    if (active < concurrency && queue.length > 0) {
      active++;
      const run = queue.shift()!;
      run();
    }
  }

  return function acquire<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn().then(
          (value) => { active--; next(); resolve(value); },
          (err) => { active--; next(); reject(err); },
        );
      });
      next();
    });
  };
}

function classifyOverbroadGlob(glob: string): { level: 'high' | 'medium' | 'low'; depth: number } | null {
  const normalized = glob.replace(/\\+/g, '/');

  // High: unconstrained catch-alls (repo-wide or directory-wide with any extension)
  if (normalized === '**/*' || normalized.endsWith('/**') || normalized.endsWith('/**/*')) {
    return { level: 'high', depth: 3 };
  }

  // Medium: recursive with wildcard filename + extension set (e.g. dist/**/*.{js,ts,map})
  if (normalized.includes('/**/*.{')) {
    return { level: 'medium', depth: 2 };
  }

  // Low: recursive with single extension (e.g. src/**/*.ts)
  if (normalized.includes('/**/*.')) {
    return { level: 'low', depth: 1 };
  }

  return null;
}

function lintConfigGlobs(config: RepoSchemaConfig, configPath: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const rule of config.files || []) {
    if (!rule.glob) continue;
    if (rule.lint?.allowOverbroad) continue;
    const classification = classifyOverbroadGlob(rule.glob);
    if (classification) {
      diagnostics.push({
        code: 'overbroad_glob_pattern',
        message: `Overbroad file glob '${rule.glob}' in rule '${rule.id || 'unnamed'}' (level: ${classification.level}, depth: ${classification.depth}). Prefer explicit allowlist paths.`,
        severity: 'warning',
        file: configPath,
        ruleId: rule.id,
        details: {
          glob: rule.glob,
          level: classification.level,
          depth: classification.depth,
          recommendation: 'Replace broad globs with explicit folder/file rules where possible.',
        },
      });
    }
  }

  for (const rule of config.folders || []) {
    if (!rule.glob) continue;
    const classification = classifyOverbroadGlob(rule.glob);
    if (classification) {
      diagnostics.push({
        code: 'overbroad_glob_pattern',
        message: `Overbroad folder glob '${rule.glob}' in rule '${rule.id || 'unnamed'}' (level: ${classification.level}, depth: ${classification.depth}).`,
        severity: 'warning',
        file: configPath,
        ruleId: rule.id,
        details: {
          glob: rule.glob,
          level: classification.level,
          depth: classification.depth,
          recommendation: 'Use explicit folder paths in allowedFolders/requiredFolders.',
        },
      });
    }
  }

  return diagnostics;
}


function getGlobExtension(glob: string): string | null {
  const match = glob.match(/\*\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

function globsCouldOverlap(globA: string, globB: string): boolean {
  const extA = getGlobExtension(globA);
  const extB = getGlobExtension(globB);
  // If both specify explicit extensions and they differ, no overlap
  if (extA && extB && extA !== extB) return false;
  return true;
}

function rootGlobCouldMatchSubtree(rootGlob: string, relSubtreeFromRoot: string): boolean {
  const normalized = rootGlob.replace(/\\/g, '/');
  // Unconstrained globs (starting with ** or no path separator) match anywhere
  if (normalized.startsWith('**/') || !normalized.includes('/')) return true;
  const firstWild = normalized.indexOf('*');
  const literalPrefix = firstWild >= 0 ? normalized.slice(0, firstWild) : normalized + '/';
  const relNorm = relSubtreeFromRoot.replace(/\\/g, '/') + '/';
  // Overlap if literal prefix is a prefix of the subtree path or vice versa
  return relNorm.startsWith(literalPrefix) || literalPrefix.startsWith(relNorm);
}

type FileRuleForConflict = { requiredSections?: string[]; schema?: { schema?: string }; filenamePattern?: string; pathCase?: string; forbidContentPatterns?: string[] };

function fileRulesConflict(rootRule: FileRuleForConflict, childRule: FileRuleForConflict): boolean {
  const rootSections = [...(rootRule.requiredSections ?? [])].sort().join(',');
  const childSections = [...(childRule.requiredSections ?? [])].sort().join(',');
  if (rootSections !== childSections && (rootSections || childSections)) return true;
  if ((rootRule.schema?.schema ?? null) !== (childRule.schema?.schema ?? null)) return true;
  if ((rootRule.filenamePattern ?? null) !== (childRule.filenamePattern ?? null)) return true;
  if ((rootRule.pathCase ?? null) !== (childRule.pathCase ?? null)) return true;
  const rootForbid = [...(rootRule.forbidContentPatterns ?? [])].sort().join(',');
  const childForbid = [...(childRule.forbidContentPatterns ?? [])].sort().join(',');
  if (rootForbid !== childForbid && (rootForbid || childForbid)) return true;
  return false;
}

export class ValidationEngine {
  constructor(private readonly adapters: ValidatorAdapter[]) {}

  async validate(
    targetPath: string,
    options?: {
      configPath?: string;
      sharedIgnoreMatcher?: IgnoreMatcher;
      globalFileIndex?: Set<string>;
      workspaceTag?: string;
      /** Pre-computed file list; when provided, skips scanFiles entirely. */
      fileList?: string[];
    },
  ): Promise<ValidationResult> {
    const absoluteTarget = path.resolve(targetPath);
    const targetRoot = fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory()
      ? absoluteTarget
      : path.dirname(absoluteTarget);
    const configPath = options?.configPath
      ? path.resolve(options.configPath)
      : findConfig(absoluteTarget);
    const repoRoot = options?.configPath ? targetRoot : path.dirname(configPath);
    const config = loadConfig(configPath);
    const files = options?.fileList ?? scanFiles(absoluteTarget, repoRoot, options?.sharedIgnoreMatcher);
    const diagnostics: Diagnostic[] = [...lintConfigGlobs(config, configPath)];

    for (const filePath of files) {
      const ruleSet = resolveEffectiveRules(config, repoRoot, filePath);
      const context: ValidatorContext = {
        repoRoot,
        configPath,
        config,
        ruleSet,
        globalFileIndex: options?.globalFileIndex,
      };

      for (const adapter of this.adapters) {
        if (!adapter.supports(filePath, context)) {
          continue;
        }
        try {
          const adapterDiagnostics = await adapter.validate(filePath, context);
          // Tag diagnostics with workspace identifier if in workspace mode
          if (options?.workspaceTag) {
            for (const d of adapterDiagnostics) {
              d.workspace = options.workspaceTag;
            }
          }
          diagnostics.push(...adapterDiagnostics);
        } catch (error) {
          diagnostics.push({
            code: 'validator_adapter_failure',
            message: `${adapter.id} failed for ${context.ruleSet.filePath}: ${(error as Error).message}`,
            severity: 'error',
            file: filePath,
            details: {
              adapter: adapter.id,
            },
            workspace: options?.workspaceTag,
          });
        }
      }
    }

    return {
      ok: diagnostics.every((d) => d.severity !== 'error'),
      diagnostics,
      filesScanned: files.length,
    };
  }

  /**
   * Validate a workspace (root + all child workspace subtrees) in parallel.
   * Auto-detects child configs under rootDir.
   */
  async validateWorkspace(
    rootDir: string,
    options: {
      noCache?: boolean;
      workspaceEnabled?: boolean;
    } = {},
  ): Promise<ValidateResult> {
    const root = path.resolve(rootDir);
    const rootConfigPath = findConfig(root);
    const repoRoot = path.dirname(rootConfigPath);

    // Build a shared ignore matcher once
    const sharedIgnoreMatcher = createIgnoreMatcher(repoRoot);

    // Discover child workspaces
    const workspaces = discoverWorkspaces(repoRoot, sharedIgnoreMatcher);

    if (workspaces.length === 0) {
      // Flat mode — no child configs found
      const result = await this.validate(rootDir, { configPath: rootConfigPath, sharedIgnoreMatcher });
      return { mode: 'flat', result };
    }

    // ── Cache handling ────────────────────────────────────────────────────
    const allConfigPaths = [rootConfigPath, ...workspaces.map((ws) => ws.configPath)];
    const currentHash = hashConfigFiles(allConfigPaths);

    let cachedWorkspaces: WorkspaceEntry[] | null = null;
    let cachedResolvedConfigs: Record<string, RepoSchemaConfig> | null = null;
    let staleCIDiag: WorkspaceConflict | null = null;

    if (!options.noCache) {
      const cached = loadWorkspaceCache(repoRoot);
      if (cached && cached.hash === currentHash) {
        cachedWorkspaces = cached.workspaces;
        cachedResolvedConfigs = cached.resolvedConfigs;
      } else if (cached && process.env.CI === 'true') {
        // Stale cache in CI — warn but continue without rebuilding cache
        staleCIDiag = {
          code: 'workspace_cache_stale',
          severity: 'warning',
          message: 'workspace cache is stale — regenerate locally with `repotype validate .`',
          parentConfigPath: rootConfigPath,
          childConfigPath: rootConfigPath,
        };
        cachedWorkspaces = null;
        cachedResolvedConfigs = null;
      }
    }

    let activeWorkspaces = workspaces;
    if (cachedWorkspaces) {
      activeWorkspaces = cachedWorkspaces;
    } else if (!options.noCache && process.env.CI !== 'true') {
      // Write fresh cache (not in CI)
      const resolvedConfigs: Record<string, RepoSchemaConfig> = {};
      for (const ws of workspaces) {
        try { resolvedConfigs[ws.configPath] = loadConfig(ws.configPath); } catch { /* skip */ }
      }
      try { resolvedConfigs[rootConfigPath] = loadConfig(rootConfigPath); } catch { /* skip */ }
      writeWorkspaceCache(repoRoot, {
        version: 2,
        hash: currentHash,
        generatedAt: new Date().toISOString(),
        repoRoot,
        workspaces,
        resolvedConfigs,
      });
    }

    // ── Global file index for cross-reference checks ───────────────────────
    const rootFiles = scanFiles(repoRoot, repoRoot, sharedIgnoreMatcher);
    const childFiles = activeWorkspaces.flatMap((ws) =>
      scanFiles(ws.subtreeRoot, repoRoot, sharedIgnoreMatcher),
    );
    const globalFileIndex = new Set<string>([...rootFiles, ...childFiles]);

    // ── Build list of files owned by root (not claimed by any child) ───────
    // We do NOT pass a filtered file list to root validate; instead we rely on
    // the fact that each child validate scans only its subtree. Root validates
    // repoRoot but child subtrees' files will be duplicated — however we then
    // build rootResult by filtering root diagnostics to root-owned files only.
    // Simpler: validate subtrees only, then validate root-owned files directly.

    const concurrency = Math.min(activeWorkspaces.length + 1, 8, os.cpus().length);
    const semaphore = createSemaphore(concurrency);

    // Validate each child workspace
    const childValidations = await Promise.all(
      activeWorkspaces.map((ws) =>
        semaphore(() =>
          this.validate(ws.subtreeRoot, {
            configPath: ws.configPath,
            sharedIgnoreMatcher,
            globalFileIndex,
            workspaceTag: ws.configPath,
          }).then((result) => ({ configPath: ws.configPath, subtreeRoot: ws.subtreeRoot, result })),
        ),
      ),
    );

    // Validate the root — only files not owned by any child
    const allRootFiles = scanFiles(repoRoot, repoRoot, sharedIgnoreMatcher);
    const rootOwnedFiles = allRootFiles.filter(
      (f) => resolveOwningWorkspace(f, activeWorkspaces) === 'root',
    );

    // Validate root using only root-owned files — no post-filter needed
    const rawRootResult = await semaphore(() =>
      this.validate(repoRoot, {
        configPath: rootConfigPath,
        sharedIgnoreMatcher,
        globalFileIndex,
        workspaceTag: rootConfigPath,
        fileList: rootOwnedFiles,
      }),
    );

    const rootResult: ValidationResult = {
      ok: rawRootResult.diagnostics.every((d) => d.severity !== 'error'),
      diagnostics: rawRootResult.diagnostics,
      filesScanned: rootOwnedFiles.length,
    };

    // ── Conflict detection ────────────────────────────────────────────────
    const conflicts: WorkspaceConflict[] = [];
    const rootConfig = loadConfig(rootConfigPath);

    for (const ws of activeWorkspaces) {
      let childConfig: RepoSchemaConfig;
      try {
        childConfig = cachedResolvedConfigs?.[ws.configPath] ?? loadConfig(ws.configPath);
      } catch {
        continue;
      }

      // workspace_required_file_gap
      for (const folder of rootConfig.folders ?? []) {
        for (const reqFile of folder.requiredFiles ?? []) {
          const absReqFile = path.resolve(repoRoot, reqFile);
          if (absReqFile.startsWith(ws.subtreeRoot + path.sep) || absReqFile === ws.subtreeRoot) {
            const childRequires = (childConfig.folders ?? []).some((cf) =>
              (cf.requiredFiles ?? []).some((rf) => path.resolve(ws.subtreeRoot, rf) === absReqFile),
            );
            if (!childRequires) {
              conflicts.push({
                code: 'workspace_required_file_gap',
                severity: 'error',
                message: `Root config requires '${reqFile}' which is inside child subtree '${ws.subtreeRoot}'. Child config does not require it — enforcement gap.`,
                parentConfigPath: rootConfigPath,
                childConfigPath: ws.configPath,
                details: { requiredFile: reqFile, subtreeRoot: ws.subtreeRoot },
              });
            }
          }
        }
      }

      // workspace_pattern_conflict: root file rule could match files in child subtree with different constraints
      const relSubtree = path.relative(repoRoot, ws.subtreeRoot);
      for (const rootRule of rootConfig.files ?? []) {
        if (!rootGlobCouldMatchSubtree(rootRule.glob, relSubtree)) continue;
        for (const childRule of childConfig.files ?? []) {
          if (!globsCouldOverlap(rootRule.glob, childRule.glob)) continue;
          if (fileRulesConflict(rootRule, childRule)) {
            conflicts.push({
              code: 'workspace_pattern_conflict',
              severity: 'warning',
              message: `Root rule glob '${rootRule.glob}' and child rule glob '${childRule.glob}' in '${ws.subtreeRoot}' may match the same files with different constraints.`,
              parentConfigPath: rootConfigPath,
              childConfigPath: ws.configPath,
              details: { rootGlob: rootRule.glob, childGlob: childRule.glob, subtreeRoot: ws.subtreeRoot },
            });
            break; // one conflict per root rule per workspace
          }
        }
      }

      // workspace_unmatched_files_asymmetry
      const rootUnmatched = rootConfig.defaults?.unmatchedFiles;
      const childUnmatched = childConfig.defaults?.unmatchedFiles;
      if (rootUnmatched && childUnmatched && rootUnmatched !== childUnmatched) {
        conflicts.push({
          code: 'workspace_unmatched_files_asymmetry',
          severity: 'warning',
          message: `Root config has unmatchedFiles='${rootUnmatched}' but child config '${ws.subtreeRoot}' has unmatchedFiles='${childUnmatched}'. Files in child subtree are subject to different rules.`,
          parentConfigPath: rootConfigPath,
          childConfigPath: ws.configPath,
          details: { rootUnmatched, childUnmatched },
        });
      }
    }

    // Surface CI stale-cache diagnostic if it was detected
    if (staleCIDiag) {
      conflicts.push(staleCIDiag);
    }

    // Emit activation suggestion only on cache-miss (first discovery or config change)
    if (!cachedWorkspaces) {
      const activationDiag: Diagnostic = {
        code: 'workspace_mode_active',
        severity: 'suggestion',
        message: `workspace mode active — ${activeWorkspaces.length} child config(s) found. Files in child subtrees are now governed by their own repotype.yaml. Root rules no longer apply to those subtrees. Run \`repotype status\` to review workspace boundaries.`,
        file: rootConfigPath,
        workspace: rootConfigPath,
      };
      rootResult.diagnostics.unshift(activationDiag);
    }

    const totalFilesScanned =
      rootResult.filesScanned + childValidations.reduce((acc, cv) => acc + cv.result.filesScanned, 0);

    const allOk =
      rootResult.ok && childValidations.every((cv) => cv.result.ok) && !conflicts.some((c) => c.severity === 'error');

    const workspaceResult: WorkspaceValidationResult = {
      ok: allOk,
      mode: 'workspace',
      filesScanned: totalFilesScanned,
      workspaces: childValidations,
      conflicts,
      rootResult,
    };

    return { mode: 'workspace', result: workspaceResult };
  }
}
