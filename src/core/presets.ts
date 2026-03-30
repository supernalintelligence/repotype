import type { RepoSchemaConfig } from './types.js';

export type RepotypePresetType = 'default' | 'strict';

function baseDefaults(): NonNullable<RepoSchemaConfig['defaults']> {
  return {
    inheritance: 'merge',
    strictness: 'balanced',
    unmatchedFiles: 'deny',
  };
}

function defaultPreset(): RepoSchemaConfig {
  return {
    version: '1',
    defaults: baseDefaults(),
    folders: [
      {
        id: 'docs-root',
        path: 'docs',
        requiredFolders: ['requirements'],
      },
    ],
    files: [
      {
        id: 'requirement-md',
        glob: 'docs/requirements/**/*.md',
        filenamePattern: '^req-[a-z0-9-]+\\.md$',
        requiredSections: ['Description', 'Acceptance Criteria', 'Test Strategy'],
      },
      {
        id: 'repotype-config',
        glob: 'repotype.yaml',
      },
    ],
  };
}

function strictPreset(): RepoSchemaConfig {
  return {
    version: '1',
    defaults: {
      ...baseDefaults(),
      strictness: 'strict',
      unmatchedFiles: 'deny',
    },
    folders: [
      {
        id: 'root-allowlist',
        path: '.',
        allowedFolders: ['docs', 'schemas', 'examples'],
        allowedFiles: ['repotype.yaml', 'README.md'],
      },
    ],
    files: [
      { id: 'repotype-config', glob: 'repotype.yaml' },
      { id: 'docs-markdown', glob: 'docs/**/*.md' },
      { id: 'schemas-json', glob: 'schemas/**/*.json' },
      { id: 'templates-markdown', glob: 'examples/templates/**/*.md' },
    ],
  };
}

export function createPresetConfig(type: RepotypePresetType): RepoSchemaConfig {
  if (type === 'default') return defaultPreset();
  if (type === 'strict') return strictPreset();
  throw new Error(`Unsupported preset type '${type}'.`);
}

export function listPresetTypes(): RepotypePresetType[] {
  return ['default', 'strict'];
}
