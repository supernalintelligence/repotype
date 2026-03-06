import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { findConfig, loadConfig } from './config-loader.js';
import { createIgnoreMatcher, getStaticIgnoreGlobs } from './path-ignore.js';
import { resolveEffectiveRules } from './rule-engine.js';
import type { Diagnostic, ValidationResult, ValidatorAdapter, ValidatorContext } from './types.js';

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
    const diagnostics: Diagnostic[] = [];

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
