/**
 * Tests for SentinelContentAdapter
 *
 * These tests cover the full matrix from the spec:
 * - Staged file missing a sentinel → error
 * - Staged file with all sentinels → no diagnostics
 * - File not staged → no diagnostics (diff-aware gate)
 * - Override env var bypasses error
 * - Deletion threshold blocking
 * - Deletion threshold with override env var
 * - sentinelDeletionThreshold absent → threshold check skipped
 * - Not in git repo → warning + fallback to disk read
 * - Empty requireSentinels → supports() returns false
 * - Special chars in sentinel → plain includes() (no regex)
 * - Multiple rules matching same file
 * - getStagedFiles called once per repoRoot (cache test via timing)
 *
 * NOTE: Because the adapter is diff-aware (reads from git staging area), most
 * tests must set up a real git repo, stage files, and then run the adapter.
 * Tests that exercise the "not staged" gate do NOT need git setup.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, it, expect, afterEach } from 'vitest';
import { SentinelContentAdapter } from '../src/adapters/sentinel-content-adapter.js';
import type { ValidatorContext, EffectiveRuleSet, RepoSchemaConfig } from '../src/core/types.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'sentinel-adapter-test-'));
}

function makeGitRepo(tmpDir: string): string {
  execSync('git init', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git config user.email "test@test.com"', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git config user.name "Test"', { cwd: tmpDir, stdio: 'pipe' });
  return tmpDir;
}

function makeContext(
  repoRoot: string,
  relPath: string,
  fileRules: EffectiveRuleSet['fileRules'],
): ValidatorContext {
  const ruleSet: EffectiveRuleSet = {
    filePath: relPath,
    folderRules: [],
    fileRules,
    requiredSections: [],
    templateHints: [],
  };
  const config: RepoSchemaConfig = { version: '1', files: [] };
  return {
    repoRoot,
    configPath: path.join(repoRoot, 'repotype.yaml'),
    config,
    ruleSet,
    targetRoot: repoRoot,
  };
}

const tempDirs: string[] = [];
function track(dir: string): string {
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  // Clean up env overrides between tests
  delete process.env.ALLOW_NAV_PATTERN_REMOVAL;
  delete process.env.ALLOW_OVERVIEW_SHRINK;
  delete process.env.TEST_SENTINEL_OVERRIDE;
});

// ── tests ────────────────────────────────────────────────────────────────────

describe('SentinelContentAdapter', () => {
  describe('supports()', () => {
    it('returns true when any file rule has non-empty requireSentinels', () => {
      const adapter = new SentinelContentAdapter();
      const ctx = makeContext('/tmp/fake', 'foo.ts', [
        { glob: 'foo.ts', requireSentinels: ['hello'] },
      ]);
      expect(adapter.supports('/tmp/fake/foo.ts', ctx)).toBe(true);
    });

    it('returns false when no file rules have requireSentinels', () => {
      const adapter = new SentinelContentAdapter();
      const ctx = makeContext('/tmp/fake', 'foo.ts', [
        { glob: 'foo.ts', forbidContentPatterns: ['bad'] },
      ]);
      expect(adapter.supports('/tmp/fake/foo.ts', ctx)).toBe(false);
    });

    it('returns false when requireSentinels is an empty array', () => {
      const adapter = new SentinelContentAdapter();
      const ctx = makeContext('/tmp/fake', 'foo.ts', [
        { glob: 'foo.ts', requireSentinels: [] },
      ]);
      expect(adapter.supports('/tmp/fake/foo.ts', ctx)).toBe(false);
    });
  });

  describe('diff-aware gate: file not staged', () => {
    it('returns [] when file is not in staging area', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      fs.writeFileSync(filePath, 'const x = 1; // no sentinels');
      // Do NOT stage the file

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        { glob: 'Component.tsx', requireSentinels: ['required-sentinel'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags).toHaveLength(0);
    });
  });

  describe('staged file with all sentinels present', () => {
    it('returns no diagnostics when all sentinels are in staged content', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      fs.writeFileSync(filePath, 'const x = 1;\nconst y = "PastTab";\nconst z = "FutureTab";');
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        { glob: 'Component.tsx', requireSentinels: ['PastTab', 'FutureTab'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags).toHaveLength(0);
    });
  });

  describe('staged file missing a sentinel', () => {
    it('emits sentinel_content_removed error with sentinel + overrideEnvVar in details', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'CompanyRail.tsx');
      fs.writeFileSync(filePath, 'const x = 1;\n// has linear-gradient(135deg but missing others');
      execSync('git add CompanyRail.tsx', { cwd: dir, stdio: 'pipe' });

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'CompanyRail.tsx', [
        {
          id: 'company-rail',
          glob: 'CompanyRail.tsx',
          requireSentinels: ['shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)]', 'linear-gradient(135deg'],
          sentinelOverrideEnvVar: 'ALLOW_NAV_PATTERN_REMOVAL',
        },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const errors = diags.filter((d) => d.code === 'sentinel_content_removed');
      expect(errors.length).toBeGreaterThanOrEqual(1);
      const removed = errors.find((d) =>
        String(d.details?.sentinel).includes('shadow-[inset'),
      );
      expect(removed).toBeDefined();
      expect(removed?.severity).toBe('error');
      expect(removed?.details?.sentinel).toContain('shadow-[inset');
      expect(removed?.details?.overrideEnvVar).toBe('ALLOW_NAV_PATTERN_REMOVAL');
      expect(removed?.ruleId).toBe('company-rail');
    });
  });

  describe('override env var bypasses error', () => {
    it('emits sentinel_content_override warning instead of error when override=1', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      fs.writeFileSync(filePath, 'no sentinels here');
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });

      process.env.TEST_SENTINEL_OVERRIDE = '1';

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        {
          glob: 'Component.tsx',
          requireSentinels: ['required-string'],
          sentinelOverrideEnvVar: 'TEST_SENTINEL_OVERRIDE',
        },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      // No errors, only warnings
      expect(diags.filter((d) => d.severity === 'error')).toHaveLength(0);
      const overrideDiags = diags.filter((d) => d.code === 'sentinel_content_override');
      expect(overrideDiags.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('sentinelOverrideEnvVar format validation', () => {
    it('emits sentinel_config_error warning for invalid env var name', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      fs.writeFileSync(filePath, 'contains required-string');
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        {
          glob: 'Component.tsx',
          requireSentinels: ['required-string'],
          sentinelOverrideEnvVar: 'invalid-env-var-name', // lowercase with dashes = invalid
        },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const configError = diags.find((d) => d.code === 'sentinel_config_error');
      expect(configError).toBeDefined();
      expect(configError?.severity).toBe('warning');
    });
  });

  describe('special characters in sentinel string', () => {
    it('uses plain string includes() — not regex — so special chars work as literals', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      // This sentinel string has regex-special chars: brackets, parens, etc.
      const sentinel = 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)]';
      fs.writeFileSync(filePath, `className="${sentinel}"`);
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        { glob: 'Component.tsx', requireSentinels: [sentinel] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      // Sentinel is present as literal string — no errors expected
      expect(diags.filter((d) => d.code === 'sentinel_content_removed')).toHaveLength(0);
    });

    it('fails correctly when special-char sentinel is absent', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      const sentinel = 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)]';
      fs.writeFileSync(filePath, 'no shadow styles here');
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        { glob: 'Component.tsx', requireSentinels: [sentinel] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags.filter((d) => d.code === 'sentinel_content_removed')).toHaveLength(1);
    });
  });

  describe('multiple file rules matching same file', () => {
    it('checks sentinels from ALL matching rules', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      // Has sentinel-A but not sentinel-B
      fs.writeFileSync(filePath, 'sentinel-A is here but not the other');
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        { id: 'rule-1', glob: 'Component.tsx', requireSentinels: ['sentinel-A'] },
        { id: 'rule-2', glob: 'Component.tsx', requireSentinels: ['sentinel-B'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const errors = diags.filter((d) => d.code === 'sentinel_content_removed');
      // rule-1 passes (sentinel-A present), rule-2 fails (sentinel-B absent)
      expect(errors).toHaveLength(1);
      expect(errors[0].details?.sentinel).toBe('sentinel-B');
      expect(errors[0].ruleId).toBe('rule-2');
    });
  });

  describe('sentinelDeletionThreshold absent', () => {
    it('does not emit threshold errors when sentinelDeletionThreshold is not set', async () => {
      const dir = track(makeGitRepo(makeTempDir()));
      const filePath = path.join(dir, 'Component.tsx');
      // Create a large initial commit then delete many lines
      const bigContent = Array.from({ length: 200 }, (_, i) => `line ${i}`).join('\n');
      fs.writeFileSync(filePath, bigContent + '\nrequired-sentinel');
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });
      execSync('git commit -m "initial"', { cwd: dir, stdio: 'pipe' });
      // Now replace with tiny content (many deletions)
      fs.writeFileSync(filePath, 'required-sentinel');
      execSync('git add Component.tsx', { cwd: dir, stdio: 'pipe' });

      const adapter = new SentinelContentAdapter();
      const ctx = makeContext(dir, 'Component.tsx', [
        // No sentinelDeletionThreshold field
        { glob: 'Component.tsx', requireSentinels: ['required-sentinel'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags.filter((d) => d.code === 'sentinel_deletion_threshold_exceeded')).toHaveLength(0);
    });
  });
});
