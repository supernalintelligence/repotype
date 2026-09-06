import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { BoardLocationSuggestedPathAdapter } from '../src/adapters/board-location-suggested-path-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

function makeContext(): ValidatorContext {
  return {} as ValidatorContext;
}

function codes(diagnostics: { code: string }[]): string[] {
  return diagnostics.map((d) => d.code);
}

describe('BoardLocationSuggestedPathAdapter', () => {
  const adapter = new BoardLocationSuggestedPathAdapter();
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  function tmp(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-board-location-test-'));
    tmpDirs.push(dir);
    return dir;
  }

  function writeYaml(base: string, boardId: string, content: string): string {
    const full = path.join(base, boardId, 'module.yaml');
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    return full;
  }

  it('supports() is true for module.yaml and board.yaml, false otherwise', () => {
    expect(adapter.supports('packages/modules/crm/module.yaml', makeContext())).toBe(true);
    expect(adapter.supports('packages/modules/crm/board.yaml', makeContext())).toBe(true);
    expect(adapter.supports('packages/modules/crm/schema.ts', makeContext())).toBe(false);
  });

  it('warns on a storage.locations[] path that deviates from its role convention', async () => {
    const base = tmp();
    const file = writeYaml(
      base,
      'crm',
      [
        'id: crm',
        'storage:',
        '  locations:',
        '    - id: reports',
        '      role: asset-cache',
        '      kind: local',
        '      path: some/random/place',
      ].join('\n'),
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(codes(diagnostics)).toEqual(['board_location_suggested_path_drift']);
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('does not warn when the path matches the role-suggested convention', async () => {
    const base = tmp();
    const file = writeYaml(
      base,
      'crm',
      [
        'id: crm',
        'storage:',
        '  locations:',
        '    - id: reports',
        '      role: asset-cache',
        '      kind: local',
        '      path: .supernal/modules/crm/assets',
      ].join('\n'),
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(diagnostics).toEqual([]);
  });

  it('does not warn on an entry with no explicit path (falls back to kind-specific default)', async () => {
    const base = tmp();
    const file = writeYaml(
      base,
      'crm',
      [
        'id: crm',
        'storage:',
        '  locations:',
        '    - id: reports-cloud',
        '      role: asset-cache',
        '      kind: google_drive',
      ].join('\n'),
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(diagnostics).toEqual([]);
  });

  it('does not warn on a role with no known suggested convention', async () => {
    const base = tmp();
    const file = writeYaml(
      base,
      'crm',
      [
        'id: crm',
        'storage:',
        '  locations:',
        '    - id: scratch',
        '      role: build-cache',
        '      kind: local',
        '      path: anywhere/at/all',
      ].join('\n'),
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(diagnostics).toEqual([]);
  });

  it('handles a list-form role, matching if ANY role in the list is satisfied', async () => {
    const base = tmp();
    const file = writeYaml(
      base,
      'application-tracker',
      [
        'id: application-tracker',
        'storage:',
        '  locations:',
        '    - id: applications',
        '      role: [bespoke-company-data, asset-cache]',
        '      kind: git_data',
        '      path: .supernal/applications',
      ].join('\n'),
    );
    const diagnostics = await adapter.validate(file, makeContext());
    expect(diagnostics).toEqual([]);
  });

  it('does nothing for a board.yaml with no storage.locations[] block', async () => {
    const base = tmp();
    const file = writeYaml(base, 'crm', ['id: crm', 'name: CRM'].join('\n'));
    const diagnostics = await adapter.validate(file, makeContext());
    expect(diagnostics).toEqual([]);
  });
});
