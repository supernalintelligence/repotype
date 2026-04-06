import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { globSync } from 'glob';
import yaml from 'js-yaml';
import type { RepoSchemaConfig, WorkspaceCache, WorkspaceEntry } from './types.js';
import { getStaticIgnoreGlobs } from './path-ignore.js';
import type { IgnoreMatcher } from './path-ignore.js';

export function findConfig(startPath: string): string {
  const resolved = path.resolve(startPath);
  const exists = fs.existsSync(resolved);
  const initial = exists
    ? (fs.statSync(resolved).isDirectory() ? resolved : path.dirname(resolved))
    : path.dirname(resolved);

  let dir = initial;

  while (true) {
    const candidates = ['repotype.yaml', 'repo-schema.yaml'];
    for (const name of candidates) {
      const candidate = path.join(dir, name);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error('No schema config found. Expected repotype.yaml or repo-schema.yaml');
    }
    dir = parent;
  }
}

function parseConfigFile(configPath: string): RepoSchemaConfig {
  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = yaml.load(raw) as RepoSchemaConfig;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid schema configuration in ${configPath}`);
  }

  return parsed;
}

function asArray(input?: string | string[]): string[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}

function mergeConfig(base: RepoSchemaConfig, override: RepoSchemaConfig): RepoSchemaConfig {
  const merged: RepoSchemaConfig = {
    version: override.version || base.version,
    defaults: {
      ...base.defaults,
      ...override.defaults,
    },
    operations: {
      hooks: {
        ...base.operations?.hooks,
        ...override.operations?.hooks,
      },
      watcher: {
        ...base.operations?.watcher,
        ...override.operations?.watcher,
      },
    },
    folders: [...(base.folders || []), ...(override.folders || [])],
    files: [...(base.files || []), ...(override.files || [])],
    templates: [...(base.templates || []), ...(override.templates || [])],
    rules: [...(base.rules || []), ...(override.rules || [])],
    plugins: [...(base.plugins || []), ...(override.plugins || [])],
  };

  if (!merged.defaults || Object.keys(merged.defaults).length === 0) {
    delete merged.defaults;
  }
  if (
    !merged.operations ||
    ((!merged.operations.hooks || Object.keys(merged.operations.hooks).length === 0) &&
      (!merged.operations.watcher || Object.keys(merged.operations.watcher).length === 0))
  ) {
    delete merged.operations;
  }

  if (merged.folders?.length === 0) delete merged.folders;
  if (merged.files?.length === 0) delete merged.files;
  if (merged.templates?.length === 0) delete merged.templates;
  if (merged.rules?.length === 0) delete merged.rules;
  if (merged.plugins?.length === 0) delete merged.plugins;

  return merged;
}

function loadConfigRecursive(configPath: string, loading: Set<string>): RepoSchemaConfig {
  const absolutePath = path.resolve(configPath);
  if (loading.has(absolutePath)) {
    throw new Error(`Circular config extends detected at ${absolutePath}`);
  }

  loading.add(absolutePath);
  const parsed = parseConfigFile(absolutePath);
  const parents = asArray(parsed.extends);

  let merged: RepoSchemaConfig = {
    version: '',
  };

  for (const parentRef of parents) {
    const parentPath = path.resolve(path.dirname(absolutePath), parentRef);
    if (!fs.existsSync(parentPath)) {
      throw new Error(`Extended config not found: ${parentPath} (from ${absolutePath})`);
    }
    const parentConfig = loadConfigRecursive(parentPath, loading);
    merged = mergeConfig(merged, parentConfig);
  }

  const current: RepoSchemaConfig = {
    ...parsed,
  };
  delete current.extends;

  merged = mergeConfig(merged, current);
  loading.delete(absolutePath);

  if (!merged.version) {
    throw new Error(`Missing required field: version in ${absolutePath} (or inherited configs)`);
  }

  return merged;
}

export function loadConfig(configPath: string): RepoSchemaConfig {
  return loadConfigRecursive(configPath, new Set());
}

// ── Workspace discovery ──────────────────────────────────────────────────────

/**
 * Collect the transitive set of config files referenced via `extends`.
 * Returns all files in the extends chain starting from configPath.
 */
export function collectExtendsDeps(configPath: string, seen = new Set<string>()): string[] {
  const absolutePath = path.resolve(configPath);
  if (seen.has(absolutePath)) return [];
  seen.add(absolutePath);

  let raw: RepoSchemaConfig;
  try {
    raw = parseConfigFile(absolutePath);
  } catch {
    return [absolutePath];
  }

  const parents = asArray(raw.extends).map((p) => path.resolve(path.dirname(absolutePath), p));
  return [absolutePath, ...parents.flatMap((p) => collectExtendsDeps(p, seen))];
}

/**
 * Compute a SHA-256 hash of all config + extends files.
 * Paths are sorted before hashing for stability.
 */
export function hashConfigFiles(configPaths: string[]): string {
  const allDeps = configPaths.flatMap((p) => collectExtendsDeps(p));
  const unique = [...new Set(allDeps)].sort();

  const hasher = crypto.createHash('sha256');
  for (const filePath of unique) {
    hasher.update(filePath);
    hasher.update('\0');
    try {
      hasher.update(fs.readFileSync(filePath, 'utf8'));
    } catch {
      // file may not exist (bad extends ref); still include path so hash changes when it appears
    }
    hasher.update('\0');
  }
  return hasher.digest('hex');
}

const CONFIG_NAMES = ['repotype.yaml', 'repo-schema.yaml'];
const WORKSPACE_CACHE_VERSION = 2 as const;

/**
 * Discover child workspace configs under rootDir.
 * Returns WorkspaceEntry[] sorted deepest-first (then alphabetically for ties).
 * The root config itself is excluded.
 */
export function discoverWorkspaces(rootDir: string, ignoreMatcher: IgnoreMatcher): WorkspaceEntry[] {
  const root = path.resolve(rootDir);

  const allPaths = globSync(['**/repotype.yaml', '**/repo-schema.yaml'], {
    cwd: root,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs(),
  });

  // Filter out root config(s) and ignored paths
  const rootConfigs = new Set(CONFIG_NAMES.map((n) => path.join(root, n)));
  const candidates = allPaths.filter((p) => {
    if (rootConfigs.has(p)) return false;
    if (ignoreMatcher.isIgnored(p)) return false;
    return true;
  });

  // Build entries
  const entries: WorkspaceEntry[] = candidates.map((configPath) => {
    const subtreeRoot = path.resolve(path.dirname(configPath));
    const depth = subtreeRoot.split(path.sep).filter(Boolean).length;
    return { configPath, subtreeRoot, depth };
  });

  // Sort deepest-first, then alphabetically for ties
  entries.sort((a, b) => {
    if (b.depth !== a.depth) return b.depth - a.depth;
    return a.subtreeRoot.localeCompare(b.subtreeRoot);
  });

  return entries;
}

/**
 * Determine which WorkspaceEntry owns a given absolute file path.
 * Workspaces must be sorted deepest-first.
 */
export function resolveOwningWorkspace(
  absoluteFilePath: string,
  workspaces: WorkspaceEntry[],
): WorkspaceEntry | 'root' {
  for (const ws of workspaces) {
    if (
      absoluteFilePath === ws.subtreeRoot ||
      absoluteFilePath.startsWith(ws.subtreeRoot + path.sep)
    ) {
      return ws;
    }
  }
  return 'root';
}

// ── Cache read/write ─────────────────────────────────────────────────────────

function getCacheFilePath(repoRoot: string): string {
  return path.join(repoRoot, '.repotype', 'cache', 'workspace.json');
}

export function loadWorkspaceCache(repoRoot: string): WorkspaceCache | null {
  const cachePath = getCacheFilePath(repoRoot);
  try {
    const raw = fs.readFileSync(cachePath, 'utf8');
    const parsed = JSON.parse(raw) as WorkspaceCache;
    if (parsed.version !== WORKSPACE_CACHE_VERSION) return null;
    if (parsed.repoRoot !== path.resolve(repoRoot)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWorkspaceCache(repoRoot: string, cache: WorkspaceCache): void {
  const cachePath = getCacheFilePath(repoRoot);
  const cacheDir = path.dirname(cachePath);
  fs.mkdirSync(cacheDir, { recursive: true });
  const tmpPath = `${cachePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(cache, null, 2), 'utf8');
    fs.renameSync(tmpPath, cachePath);
  } catch {
    // best-effort; don't fail validation if cache write fails
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}
