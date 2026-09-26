import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { CronIndexDriftAdapter } from '../src/adapters/cron-index-drift-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

function writeIndex(root: string, entries: Array<Record<string, unknown>>): string {
  const dir = path.join(root, '.supernal', 'modules');
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, 'crons.index.json');
  fs.writeFileSync(p, JSON.stringify({ version: 1, total: entries.length, entries }, null, 2));
  return p;
}

function writeCronsJson(root: string, crons: Record<string, Array<{ id: string }>>): void {
  const dir = path.join(root, '.supernal', 'modules');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'crons.json'), JSON.stringify({ version: 1, crons }));
}

const board = (boardId: string, cronId: string, declaredBy: string | null, sources = ['sqlite']) => ({
  system: 'board',
  boardId,
  cronId,
  sources,
  declaredBy,
});

function ctx(root: string): ValidatorContext {
  return { repoRoot: root, targetRoot: root } as unknown as ValidatorContext;
}

describe('CronIndexDriftAdapter — declared-source rule', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });
    dirs.length = 0;
  });
  const tmp = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-cron-index-'));
    dirs.push(d);
    return d;
  };

  it('fails a committed board row with declaredBy: null, even with no crons.json (worktree/CI)', async () => {
    const root = tmp();
    const indexPath = writeIndex(root, [
      board('crm', 'hourly-sync', 'crons.yaml'),
      board('crm', 'stale', null),
      { system: 'maintenance', boardId: 'maintenance', cronId: 'x', sources: [], declaredBy: 'substrate' },
    ]);
    const diags = await new CronIndexDriftAdapter().validate(indexPath, ctx(root));
    expect(diags.map((d) => d.code)).toEqual(['cron_index_undeclared']);
    expect(diags[0]!.details).toEqual({ boardId: 'crm', cronId: 'stale' });
  });

  it('flags an index that predates declared-source tracking', async () => {
    const root = tmp();
    const indexPath = writeIndex(root, [{ system: 'board', boardId: 'crm', cronId: 'a', sources: ['sqlite'] }]);
    const diags = await new CronIndexDriftAdapter().validate(indexPath, ctx(root));
    expect(diags.map((d) => d.code)).toEqual(['cron_index_stale']);
  });

  it('passes a fully declared index and still checks crons.json -> index when crons.json exists', async () => {
    const root = tmp();
    const indexPath = writeIndex(root, [board('crm', 'a', 'crons.yaml', ['crons.json', 'sqlite'])]);
    writeCronsJson(root, { crm: [{ id: 'a' }, { id: 'b' }] });
    const diags = await new CronIndexDriftAdapter().validate(indexPath, ctx(root));
    expect(diags.map((d) => `${d.code}:${(d.details as { cronId?: string } | undefined)?.cronId}`)).toEqual([
      'cron_index_stale:b',
    ]);
  });
});
