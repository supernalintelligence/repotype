import type { RepoSchemaConfig } from './types.js';

export type RepotypePresetType = 'default';

function baseDefaults(): NonNullable<RepoSchemaConfig['defaults']> {
  return {
    inheritance: 'merge',
    strictness: 'balanced',
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
    ],
  };
}

export function createPresetConfig(type: RepotypePresetType): RepoSchemaConfig {
  if (type !== 'default') {
    throw new Error(`Unsupported preset type '${type}'.`);
  }
  return defaultPreset();
}

export function listPresetTypes(): RepotypePresetType[] {
  return ['default'];
}
