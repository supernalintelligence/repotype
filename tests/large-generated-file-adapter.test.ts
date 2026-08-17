import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { LargeGeneratedFileAdapter } from '../src/adapters/large-generated-file-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

function makeContext(repoRoot: string): ValidatorContext {
  return { repoRoot } as ValidatorContext;
}

function codes(diagnostics: { code: string }[]): string[] {
  return diagnostics.map((d) => d.code);
}

describe('LargeGeneratedFileAdapter', () => {
  const adapter = new LargeGeneratedFileAdapter();
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  function tmp(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-large-file-test-'));
    tmpDirs.push(dir);
    return dir;
  }

  function writeFile(base: string, relPath: string, content: Buffer | string): string {
    const full = path.join(base, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    return full;
  }

  it('supports() is true for any file (path/size-based, not content-based)', () => {
    expect(adapter.supports('/anything.ts', {} as ValidatorContext)).toBe(true);
  });

  it('flags .next/cache paths as errors regardless of size', async () => {
    const base = tmp();
    const file = writeFile(base, '.next/cache/webpack/0.pack', 'tiny');
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['generated_path_tracked']);
    expect(diagnostics[0].severity).toBe('error');
  });

  it('flags node_modules paths as errors', async () => {
    const base = tmp();
    const file = writeFile(base, 'node_modules/foo/index.js', 'x');
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['generated_path_tracked']);
  });

  it('flags .pack.gz files anywhere as errors', async () => {
    const base = tmp();
    const file = writeFile(base, 'somewhere/0.pack.gz', 'x');
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['generated_path_tracked']);
  });

  it('flags ralph-log-shaped filenames as errors regardless of size', async () => {
    const base = tmp();
    const file = writeFile(base, '.ralph-log-ralph-123-456.jsonl', 'x');
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['log_shaped_file_tracked']);
    expect(diagnostics[0].severity).toBe('error');
  });

  it('warns on a large .jsonl file that is not log-named', async () => {
    const base = tmp();
    const big = Buffer.alloc(2 * 1024 * 1024, 'a'); // 2MB > 1MB jsonl threshold
    const file = writeFile(base, 'data/export.jsonl', big);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['large_jsonl_tracked']);
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('does not flag a small .jsonl file', async () => {
    const base = tmp();
    const file = writeFile(base, 'data/fixture.jsonl', '{"a":1}\n');
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(diagnostics).toEqual([]);
  });

  it('warns on any generic file over the 5MB threshold', async () => {
    const base = tmp();
    const big = Buffer.alloc(6 * 1024 * 1024, 'a');
    const file = writeFile(base, 'assets/big-image.png', big);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['large_file_tracked']);
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('warns on a tracked mp3 over the 100KB media threshold', async () => {
    const base = tmp();
    const big = Buffer.alloc(150 * 1024, 'a'); // 150KB > 100KB media threshold, well under 5MB generic
    const file = writeFile(base, 'apps/marketing-video/voiceover/line-01.mp3', big);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['tracked_media_binary']);
    expect(diagnostics[0].severity).toBe('warning');
    expect(diagnostics[0].message).toContain('storage.git_data');
    expect(diagnostics[0].message).toContain('Drive asset-pairing');
    expect(diagnostics[0].message).toContain('gitTracked:');
  });

  it('warns on a tracked mp4 over the 100KB media threshold', async () => {
    const base = tmp();
    const big = Buffer.alloc(200 * 1024, 'a');
    const file = writeFile(base, 'apps/supernal-dashboard/videos/stories/demo.mp4', big);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['tracked_media_binary']);
  });

  it('warns on a tracked pdf over the 100KB media threshold (advisory only, non-blocking)', async () => {
    const base = tmp();
    const big = Buffer.alloc(150 * 1024, 'a');
    const file = writeFile(base, 'docs/whitepaper.pdf', big);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['tracked_media_binary']);
    expect(diagnostics[0].severity).toBe('warning');
  });

  it('does not flag a small tracked mp3 under the media threshold', async () => {
    const base = tmp();
    const small = Buffer.alloc(50 * 1024, 'a'); // 50KB < 100KB
    const file = writeFile(base, 'assets/ding.mp3', small);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(diagnostics).toEqual([]);
  });

  it('does not flag media files inside a declared .gitmodules submodule mount', async () => {
    const base = tmp();
    fs.writeFileSync(
      path.join(base, '.gitmodules'),
      '[submodule ".supernal/applications"]\n\tpath = .supernal/applications\n\turl = git@github.com:example/applications.git\n'
    );
    const big = Buffer.alloc(200 * 1024, 'a');
    const file = writeFile(base, '.supernal/applications/demo-video.mp4', big);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(diagnostics).toEqual([]);
  });

  it('still flags media files OUTSIDE a declared submodule mount when .gitmodules exists', async () => {
    const base = tmp();
    fs.writeFileSync(
      path.join(base, '.gitmodules'),
      '[submodule ".supernal/applications"]\n\tpath = .supernal/applications\n\turl = git@github.com:example/applications.git\n'
    );
    const big = Buffer.alloc(200 * 1024, 'a');
    const file = writeFile(base, 'apps/marketing-video/demo.mp4', big);
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(codes(diagnostics)).toEqual(['tracked_media_binary']);
  });

  it('does not flag a normal small source file', async () => {
    const base = tmp();
    const file = writeFile(base, 'src/index.ts', 'export const x = 1;\n');
    const diagnostics = await adapter.validate(file, makeContext(base));
    expect(diagnostics).toEqual([]);
  });

  it('does not crash on a file that no longer exists at validate time', async () => {
    const base = tmp();
    const missing = path.join(base, 'gone.ts');
    const diagnostics = await adapter.validate(missing, makeContext(base));
    expect(diagnostics).toEqual([]);
  });
});
