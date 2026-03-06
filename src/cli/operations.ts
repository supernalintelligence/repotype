import fs from 'node:fs';
import path from 'node:path';
import { findConfig, loadConfig } from '../core/config-loader.js';
import { installChecks, inspectChecks, uninstallChecks } from './git-hooks.js';
import { inspectWatcher, installWatcher, uninstallWatcher } from './watcher.js';

export interface NormalizedOperationsConfig {
  hooks: {
    enabled: boolean;
    hook: 'pre-commit' | 'pre-push' | 'both';
  };
  watcher: {
    enabled: boolean;
    schedule: string;
    queueDir: string;
    minErrors: number;
    logFile: string;
  };
}

function resolveRepoRoot(target: string): { repoRoot: string; configPath: string } {
  const absolute = path.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path.dirname(configPath);
  return { repoRoot, configPath };
}

function normalizeOperations(target: string): {
  repoRoot: string;
  configPath: string;
  config: NormalizedOperationsConfig;
} {
  const { repoRoot, configPath } = resolveRepoRoot(target);
  const config = loadConfig(configPath);

  const normalized: NormalizedOperationsConfig = {
    hooks: {
      enabled: config.operations?.hooks?.enabled ?? false,
      hook: config.operations?.hooks?.hook ?? 'both',
    },
    watcher: {
      enabled: config.operations?.watcher?.enabled ?? false,
      schedule: config.operations?.watcher?.schedule ?? '*/15 * * * *',
      queueDir: path.resolve(repoRoot, config.operations?.watcher?.queueDir ?? 'sort_queue'),
      minErrors: config.operations?.watcher?.minErrors ?? 3,
      logFile: path.resolve(repoRoot, config.operations?.watcher?.logFile ?? '.repotype/logs/watcher.log'),
    },
  };

  return {
    repoRoot,
    configPath,
    config: normalized,
  };
}

function readLastCleanupEntry(queueDir: string): { found: boolean; entry?: Record<string, unknown> } {
  const logPath = path.join(queueDir, 'cleanup-log.jsonl');
  if (!fs.existsSync(logPath)) {
    return { found: false };
  }

  const lines = fs.readFileSync(logPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { found: false };
  }

  try {
    return { found: true, entry: JSON.parse(lines[lines.length - 1]) };
  } catch {
    return { found: false };
  }
}

export function getOperationsStatus(target: string): {
  repoRoot: string;
  configPath: string;
  config: NormalizedOperationsConfig;
  hooks: ReturnType<typeof inspectChecks>;
  watcher: ReturnType<typeof inspectWatcher>;
  cleanup: { queueDir: string; lastRun: { found: boolean; entry?: Record<string, unknown> } };
} {
  const normalized = normalizeOperations(target);
  const hooks = inspectChecks(normalized.repoRoot);
  const watcher = inspectWatcher(normalized.repoRoot);
  const cleanup = {
    queueDir: normalized.config.watcher.queueDir,
    lastRun: readLastCleanupEntry(normalized.config.watcher.queueDir),
  };

  return {
    repoRoot: normalized.repoRoot,
    configPath: normalized.configPath,
    config: normalized.config,
    hooks,
    watcher,
    cleanup,
  };
}

export function applyOperationsConfig(target: string): {
  repoRoot: string;
  configPath: string;
  applied: {
    hooks: ReturnType<typeof installChecks> | ReturnType<typeof uninstallChecks>;
    watcher: ReturnType<typeof installWatcher> | ReturnType<typeof uninstallWatcher>;
  };
} {
  const normalized = normalizeOperations(target);

  const hooks = normalized.config.hooks.enabled
    ? installChecks({ target: normalized.repoRoot, hook: normalized.config.hooks.hook })
    : uninstallChecks({ target: normalized.repoRoot, hook: normalized.config.hooks.hook });

  const watcher = normalized.config.watcher.enabled
    ? installWatcher({
      target: normalized.repoRoot,
      schedule: normalized.config.watcher.schedule,
      queueDir: normalized.config.watcher.queueDir,
      minErrors: normalized.config.watcher.minErrors,
      logFile: normalized.config.watcher.logFile,
      dryRun: false,
    })
    : uninstallWatcher(normalized.repoRoot);

  return {
    repoRoot: normalized.repoRoot,
    configPath: normalized.configPath,
    applied: {
      hooks,
      watcher,
    },
  };
}
