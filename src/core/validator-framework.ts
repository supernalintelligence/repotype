import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { findConfig, loadConfig } from './config-loader.js';
import { createIgnoreMatcher, getStaticIgnoreGlobs } from './path-ignore.js';
import { resolveEffectiveRules } from './rule-engine.js';
import type { Diagnostic, RepoSchemaConfig, ValidationResult, ValidatorAdapter, ValidatorContext } from './types.js';

function scanFiles(targetPath: string, repoRoot: string): string[] {
  const ignoreMatcher = createIgnoreMatcher(repoRoot);
  const stats = fs.statSync(targetPath);
  if (stats.isFile()) {
    const absoluteFile = path.resolve(targetPath);
    return ignoreMatcher.isIgnored(absoluteFile) ? [] : [absoluteFile];
  }

  const files = globSync('**/*', {
    cwd: targetPath,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs(),
  });
  return files.filter((filePath) => !ignoreMatcher.isIgnored(filePath));
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

export class ValidationEngine {
  constructor(private readonly adapters: ValidatorAdapter[]) {}

  async validate(targetPath: string, options?: { configPath?: string }): Promise<ValidationResult> {
    const absoluteTarget = path.resolve(targetPath);
    const targetRoot = fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory()
      ? absoluteTarget
      : path.dirname(absoluteTarget);
    const configPath = options?.configPath
      ? path.resolve(options.configPath)
      : findConfig(absoluteTarget);
    const repoRoot = options?.configPath ? targetRoot : path.dirname(configPath);
    const config = loadConfig(configPath);
    const files = scanFiles(absoluteTarget, repoRoot);
    const diagnostics: Diagnostic[] = [...lintConfigGlobs(config, configPath)];

    for (const filePath of files) {
      const ruleSet = resolveEffectiveRules(config, repoRoot, filePath);
      const context: ValidatorContext = {
        repoRoot,
        configPath,
        config,
        ruleSet,
      };

      for (const adapter of this.adapters) {
        if (!adapter.supports(filePath, context)) {
          continue;
        }
        try {
          const adapterDiagnostics = await adapter.validate(filePath, context);
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
}
