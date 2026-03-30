import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { RepoSchemaConfig } from './types.js';

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
