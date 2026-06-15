import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { CronRegistryDriftAdapter } from '../src/adapters/cron-registry-drift-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

/**
 * Test harness: builds a fake monorepo root with packages/boards/<id>/board.yaml
 * files and a .supernal/modules/crons.json registry, then runs the adapter.
 *
 * The adapter is a repo-level rule that performs a full declared×registered diff.
 * It self-selects on board.yaml (under packages/boards/) and on crons.json, so a
 * test invokes it by passing one of those file paths.
 */

interface BoardCronDecl {
  id: string;
  schedule?: string;
  action?: string;
  description?: string;
  enabled?: boolean;
}

interface RegistryCron {
  id: string;
  enabled?: boolean;
  source?: string;
  removedFromYaml?: boolean;
}

function writeBoardYaml(root: string, boardId: string, crons: BoardCronDecl[] | null): string {
  const dir = path.join(root, 'packages', 'boards', boardId);
  fs.mkdirSync(dir, { recursive: true });
  const lines: string[] = [`id: ${boardId}`, 'label: Test', 'description: test board'];
  if (crons !== null) {
    lines.push('crons:');
    for (const c of crons) {
      lines.push(`  - id: ${c.id}`);
      lines.push(`    schedule: "${c.schedule ?? '0 0 * * *'}"`);
      lines.push(`    action: ${c.action ?? c.id}`);
      lines.push(`    description: ${c.description ?? 'test cron'}`);
      if (c.enabled !== undefined) lines.push(`    enabled: ${c.enabled}`);
    }
  }
  const p = path.join(dir, 'board.yaml');
  fs.writeFileSync(p, lines.join('\n') + '\n');
  return p;
}

function writeCronsJson(root: string, crons: Record<string, RegistryCron[]>): string {
  const dir = path.join(root, '.supernal', 'modules');
  fs.mkdirSync(dir, { recursive: true });
  const data = {
    version: 1,
    crons: Object.fromEntries(
      Object.entries(crons).map(([boardId, list]) => [
        boardId,
        list.map((c) => ({
          id: c.id,
          boardId,
          schedule: '0 0 * * *',
          action: c.id,
          description: 'test',
          enabled: c.enabled ?? true,
          source: c.source ?? 'yaml',
          ...(c.removedFromYaml ? { removedFromYaml: true } : {}),
        })),
      ]),
    ),
  };
  const p = path.join(dir, 'crons.json');
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  return p;
}

function makeContext(root: string): ValidatorContext {
  return { repoRoot: root, targetRoot: root } as unknown as ValidatorContext;
}

describe('CronRegistryDriftAdapter', () => {
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  function tmp(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-cron-'));
    tmpDirs.push(dir);
    return dir;
  }

  it('supports board.yaml under packages/boards and crons.json', () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = path.join(root, 'packages', 'boards', 'finances', 'board.yaml');
    const cronsJson = path.join(root, '.supernal', 'modules', 'crons.json');
    expect(adapter.supports(boardYaml, makeContext(root))).toBe(true);
    expect(adapter.supports(cronsJson, makeContext(root))).toBe(true);
  });

  it('does not support unrelated files', () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    expect(adapter.supports(path.join(root, 'packages', 'boards', 'finances', 'schema.ts'), makeContext(root))).toBe(false);
    expect(adapter.supports(path.join(root, 'README.md'), makeContext(root))).toBe(false);
  });

  it('(a) reports a declared-but-unregistered cron as DRIFT/error', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [{ id: 'sync-expenses' }]);
    // Registry has no entry for finances at all
    writeCronsJson(root, {});

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    const drift = diagnostics.filter((d) => d.code === 'cron_declared_but_unregistered');
    expect(drift).toHaveLength(1);
    expect(drift[0].severity).toBe('error');
    expect(drift[0].message).toContain('finances/sync-expenses');
  });

  it('(b) reports a registered source:yaml cron absent from board.yaml as ORPHAN/error', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [{ id: 'sync-expenses' }]);
    // Registry has the declared one PLUS a ghost yaml-sourced entry not in board.yaml
    writeCronsJson(root, {
      finances: [
        { id: 'sync-expenses', source: 'yaml' },
        { id: 'ghost-cron', source: 'yaml' },
      ],
    });

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    const orphans = diagnostics.filter((d) => d.code === 'cron_registered_but_undeclared');
    expect(orphans).toHaveLength(1);
    expect(orphans[0].severity).toBe('error');
    expect(orphans[0].message).toContain('finances/ghost-cron');
  });

  it('(c) surfaces an explicitly-disabled cron as informational, NOT an error', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [{ id: 'sync-expenses', enabled: false }]);
    // Registry materializes it disabled — this is a deliberate "off", not drift
    writeCronsJson(root, {
      finances: [{ id: 'sync-expenses', enabled: false, source: 'yaml' }],
    });

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    const disabled = diagnostics.filter((d) => d.code === 'cron_explicitly_disabled');
    expect(disabled).toHaveLength(1);
    expect(disabled[0].severity).not.toBe('error');
    expect(disabled[0].message).toContain('finances/sync-expenses');
    // Crucially: a disabled-but-materialized cron is NOT drift
    expect(diagnostics.some((d) => d.code === 'cron_declared_but_unregistered')).toBe(false);
    expect(diagnostics.every((d) => d.severity !== 'error')).toBe(true);
  });

  it('(d) passes cleanly when board.yaml and registry are fully consistent', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [
      { id: 'sync-expenses' },
      { id: 'daily-report' },
    ]);
    writeCronsJson(root, {
      finances: [
        { id: 'sync-expenses', source: 'yaml' },
        { id: 'daily-report', source: 'yaml' },
      ],
    });

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    const errors = diagnostics.filter((d) => d.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('excludes reconcile-excluded dirs (templates, lib, shared-ui, __planner, __system__)', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    // A declared cron in an excluded dir must NOT be treated as drift
    const boardYaml = writeBoardYaml(root, 'templates', [{ id: 'tmpl-cron' }]);
    writeCronsJson(root, {});

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    expect(diagnostics.some((d) => d.code === 'cron_declared_but_unregistered')).toBe(false);
  });

  it('ignores non-yaml-sourced registry entries when computing orphans', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [{ id: 'sync-expenses' }]);
    writeCronsJson(root, {
      finances: [
        { id: 'sync-expenses', source: 'yaml' },
        // a runtime-sourced (non-yaml) entry is legitimately registry-only — not an orphan
        { id: 'manual-trigger', source: 'manual' },
      ],
    });

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    expect(diagnostics.some((d) => d.code === 'cron_registered_but_undeclared')).toBe(false);
  });

  it('does not flag a soft-removed (removedFromYaml) registry entry as an orphan', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [{ id: 'sync-expenses' }]);
    writeCronsJson(root, {
      finances: [
        { id: 'sync-expenses', source: 'yaml' },
        { id: 'old-cron', source: 'yaml', enabled: false, removedFromYaml: true },
      ],
    });

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    expect(diagnostics.some((d) => d.code === 'cron_registered_but_undeclared')).toBe(false);
  });

  it('errors loudly (no silent pass) when crons.json is missing', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [{ id: 'sync-expenses' }]);
    // No crons.json written at all

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    const missing = diagnostics.filter((d) => d.code === 'cron_registry_missing');
    expect(missing).toHaveLength(1);
    expect(missing[0].severity).toBe('error');
  });

  it('errors loudly (no silent pass) when crons.json is unparseable', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    const boardYaml = writeBoardYaml(root, 'finances', [{ id: 'sync-expenses' }]);
    const dir = path.join(root, '.supernal', 'modules');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'crons.json'), '{ this is not json ');

    const diagnostics = await adapter.validate(boardYaml, makeContext(root));
    const unparseable = diagnostics.filter((d) => d.code === 'cron_registry_unparseable');
    expect(unparseable).toHaveLength(1);
    expect(unparseable[0].severity).toBe('error');
  });

  it('produces the diff exactly once even when invoked via crons.json path', async () => {
    const adapter = new CronRegistryDriftAdapter();
    const root = tmp();
    writeBoardYaml(root, 'finances', [{ id: 'sync-expenses' }]);
    const cronsJson = writeCronsJson(root, {});

    const diagnostics = await adapter.validate(cronsJson, makeContext(root));
    const drift = diagnostics.filter((d) => d.code === 'cron_declared_but_unregistered');
    expect(drift).toHaveLength(1);
    expect(drift[0].message).toContain('finances/sync-expenses');
  });
});
