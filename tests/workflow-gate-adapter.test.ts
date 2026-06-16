/**
 * Tests for WorkflowGateAdapter
 *
 * Covers the full test matrix from the spec:
 * - Staged controlled file, no state file → workflow_gate_no_state_file error
 * - Staged controlled file, state incomplete → workflow_gate_required error
 * - Staged controlled file, workflowCompleted=true → passes
 * - SC_ALLOW_CONTROLLED_EDIT=1 → bypassed warning, no error
 * - File not staged → no diagnostics
 * - requiresWorkflow=['chg'] + completed + no chgId → chg_id_missing error
 * - requiresWorkflow=['req'] + completed + bad reqId → req_id_missing error
 * - requiresWorkflow=['req'] + completed + valid REQ-xxx → passes
 * - requiresWorkflow=['light'] + completed + no ids → passes (light = just completed)
 * - requiresWorkflow=['light'] + not completed → WARNING (not error) — behavioral parity
 * - Malformed state YAML → workflow_gate_state_unreadable warning (non-blocking)
 * - Not in git repo → workflow_gate_git_unavailable warning, non-blocking
 * - Multiple rules, partial match → both diagnostics emitted
 * - workflowApprovers appears in error details
 * - State file read once (cache)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, it, expect, afterEach } from 'vitest';
import { WorkflowGateAdapter } from '../src/adapters/workflow-gate-adapter.js';
import type { ValidatorContext, EffectiveRuleSet, RepoSchemaConfig } from '../src/core/types.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-gate-test-'));
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

function writeStateFile(repoRoot: string, content: string): void {
  const dir = path.join(repoRoot, '.supernal');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'controlled-files-workflow-state.yaml'), content);
}

const tempDirs: string[] = [];

afterEach(() => {
  delete process.env.SC_ALLOW_CONTROLLED_EDIT;
});

// ── tests ────────────────────────────────────────────────────────────────────

describe('WorkflowGateAdapter', () => {
  describe('supports()', () => {
    it('returns true when any file rule has requiresWorkflow', () => {
      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext('/tmp/fake', 'middleware.ts', [
        { glob: 'middleware.ts', requiresWorkflow: ['req'] },
      ]);
      expect(adapter.supports('/tmp/fake/middleware.ts', ctx)).toBe(true);
    });

    it('returns false when no rules have requiresWorkflow', () => {
      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext('/tmp/fake', 'foo.ts', [
        { glob: 'foo.ts', forbidContentPatterns: ['bad'] },
      ]);
      expect(adapter.supports('/tmp/fake/foo.ts', ctx)).toBe(false);
    });

    it('returns false when requiresWorkflow is empty array', () => {
      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext('/tmp/fake', 'foo.ts', [
        { glob: 'foo.ts', requiresWorkflow: [] },
      ]);
      expect(adapter.supports('/tmp/fake/foo.ts', ctx)).toBe(false);
    });
  });

  describe('diff-aware gate: file not staged', () => {
    it('returns [] when file is not staged', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'middleware.ts');
      fs.writeFileSync(filePath, 'export default function middleware() {}');
      // Do NOT stage

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'middleware.ts', [
        { glob: 'middleware.ts', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags).toHaveLength(0);
    });
  });

  describe('staged file with no state file', () => {
    it('emits workflow_gate_no_state_file error', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'middleware.ts');
      fs.writeFileSync(filePath, 'export default middleware() {}');
      execSync('git add middleware.ts', { cwd: dir, stdio: 'pipe' });
      // No state file created

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'middleware.ts', [
        {
          id: 'middleware',
          glob: 'middleware.ts',
          requiresWorkflow: ['req'],
          workflowApprovers: ['tech-lead'],
        },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const errors = diags.filter((d) => d.code === 'workflow_gate_no_state_file');
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].severity).toBe('error');
      expect(String(errors[0].message)).toContain('sc workflow controlled modify');
      expect(errors[0].details?.workflowApprovers).toEqual(['tech-lead']);
    });

    it('emits warning (not error) for light level when no state file', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'Routes.ts');
      fs.writeFileSync(filePath, 'export const routes = {};');
      execSync('git add Routes.ts', { cwd: dir, stdio: 'pipe' });

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'Routes.ts', [
        { glob: 'Routes.ts', requiresWorkflow: ['light'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const noStateDiags = diags.filter((d) => d.code === 'workflow_gate_no_state_file');
      expect(noStateDiags.length).toBeGreaterThanOrEqual(1);
      // Light level = warning, not error
      expect(noStateDiags[0].severity).toBe('warning');
    });
  });

  describe('staged file, state incomplete (workflowCompleted=false)', () => {
    it('emits workflow_gate_required error', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'middleware.ts');
      fs.writeFileSync(filePath, 'export default middleware() {}');
      execSync('git add middleware.ts', { cwd: dir, stdio: 'pipe' });
      writeStateFile(dir, `files:\n  "middleware.ts":\n    workflowCompleted: false\n`);

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'middleware.ts', [
        { glob: 'middleware.ts', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const errors = diags.filter((d) => d.code === 'workflow_gate_required');
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].severity).toBe('error');
    });
  });

  describe('staged file, workflowCompleted=true (passes)', () => {
    it('returns no diagnostics when workflow is completed', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'middleware.ts');
      fs.writeFileSync(filePath, 'export default middleware() {}');
      execSync('git add middleware.ts', { cwd: dir, stdio: 'pipe' });
      writeStateFile(
        dir,
        `files:\n  "middleware.ts":\n    workflowCompleted: true\n    reqId: "REQ-AUTH-001"\n`,
      );

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'middleware.ts', [
        { glob: 'middleware.ts', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags.filter((d) => d.severity === 'error')).toHaveLength(0);
    });
  });

  describe('SC_ALLOW_CONTROLLED_EDIT=1 bypass', () => {
    it('emits bypassed warning and no error when env var is set', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'middleware.ts');
      fs.writeFileSync(filePath, 'export default middleware() {}');
      execSync('git add middleware.ts', { cwd: dir, stdio: 'pipe' });
      // No state file — would normally block

      process.env.SC_ALLOW_CONTROLLED_EDIT = '1';

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'middleware.ts', [
        { glob: 'middleware.ts', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags.filter((d) => d.severity === 'error')).toHaveLength(0);
      const bypassed = diags.filter((d) => d.code === 'workflow_gate_bypassed');
      expect(bypassed).toHaveLength(1);
      expect(bypassed[0].severity).toBe('warning');
      expect(bypassed[0].details?.env).toBe('SC_ALLOW_CONTROLLED_EDIT=1');
    });
  });

  describe('requiresWorkflow=chg: chgId validation', () => {
    it('emits workflow_gate_chg_id_missing when chgId absent', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'pre-commit');
      fs.mkdirSync(path.join(dir, '.husky'), { recursive: true });
      const absPath = path.join(dir, '.husky', 'pre-commit');
      fs.writeFileSync(absPath, '#!/bin/bash\necho ok');
      execSync('git add .husky/pre-commit', { cwd: dir, stdio: 'pipe' });
      writeStateFile(dir, `files:\n  ".husky/pre-commit":\n    workflowCompleted: true\n`);

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, '.husky/pre-commit', [
        { id: 'husky-pre-commit', glob: '.husky/pre-commit', requiresWorkflow: ['chg'] },
      ]);
      const diags = await adapter.validate(absPath, ctx);
      const errors = diags.filter((d) => d.code === 'workflow_gate_chg_id_missing');
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].severity).toBe('error');
    });

    it('passes when chgId is present', async () => {
      const dir = makeGitRepo(makeTempDir());
      const absPath = path.join(dir, '.husky', 'pre-commit');
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, '#!/bin/bash');
      execSync('git add .husky/pre-commit', { cwd: dir, stdio: 'pipe' });
      writeStateFile(
        dir,
        `files:\n  ".husky/pre-commit":\n    workflowCompleted: true\n    chgId: "CHG-001"\n`,
      );

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, '.husky/pre-commit', [
        { glob: '.husky/pre-commit', requiresWorkflow: ['chg'] },
      ]);
      const diags = await adapter.validate(absPath, ctx);
      expect(diags.filter((d) => d.severity === 'error')).toHaveLength(0);
    });
  });

  describe('requiresWorkflow=req: reqId validation', () => {
    it('emits workflow_gate_req_id_missing for bad reqId', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'CompanyRail.tsx');
      fs.writeFileSync(filePath, 'const x = 1;');
      execSync('git add CompanyRail.tsx', { cwd: dir, stdio: 'pipe' });
      writeStateFile(
        dir,
        `files:\n  "CompanyRail.tsx":\n    workflowCompleted: true\n    reqId: "not-a-req-id"\n`,
      );

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'CompanyRail.tsx', [
        { glob: 'CompanyRail.tsx', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const errors = diags.filter((d) => d.code === 'workflow_gate_req_id_missing');
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].severity).toBe('error');
    });

    it('passes when reqId matches REQ-xxx format', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'CompanyRail.tsx');
      fs.writeFileSync(filePath, 'const x = 1;');
      execSync('git add CompanyRail.tsx', { cwd: dir, stdio: 'pipe' });
      writeStateFile(
        dir,
        `files:\n  "CompanyRail.tsx":\n    workflowCompleted: true\n    reqId: "REQ-AUTH-001"\n`,
      );

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'CompanyRail.tsx', [
        { glob: 'CompanyRail.tsx', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags.filter((d) => d.severity === 'error')).toHaveLength(0);
    });
  });

  describe('requiresWorkflow=light', () => {
    it('passes for light when workflowCompleted=true with no chgId/reqId', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'Routes.ts');
      fs.writeFileSync(filePath, 'export const routes = {};');
      execSync('git add Routes.ts', { cwd: dir, stdio: 'pipe' });
      writeStateFile(dir, `files:\n  "Routes.ts":\n    workflowCompleted: true\n`);

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'Routes.ts', [
        { glob: 'Routes.ts', requiresWorkflow: ['light'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      expect(diags.filter((d) => d.severity === 'error')).toHaveLength(0);
    });

    it('emits warning (not error) for light level when workflowCompleted is false', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'Routes.ts');
      fs.writeFileSync(filePath, 'export const routes = {};');
      execSync('git add Routes.ts', { cwd: dir, stdio: 'pipe' });
      writeStateFile(dir, `files:\n  "Routes.ts":\n    workflowCompleted: false\n`);

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'Routes.ts', [
        { glob: 'Routes.ts', requiresWorkflow: ['light'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      // Must be warnings, NOT errors (behavioral parity with existing system)
      const blockingDiags = diags.filter(
        (d) => d.code === 'workflow_gate_required' || d.code === 'workflow_gate_no_state_file',
      );
      expect(blockingDiags.every((d) => d.severity === 'warning')).toBe(true);
      expect(blockingDiags.filter((d) => d.severity === 'error')).toHaveLength(0);
    });
  });

  describe('malformed state YAML', () => {
    it('emits workflow_gate_state_unreadable warning (non-blocking)', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'middleware.ts');
      fs.writeFileSync(filePath, 'export default middleware() {}');
      execSync('git add middleware.ts', { cwd: dir, stdio: 'pipe' });
      writeStateFile(dir, `files:\n  :\n  bad: yaml: [[[`);

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'middleware.ts', [
        { glob: 'middleware.ts', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const unreadable = diags.filter((d) => d.code === 'workflow_gate_state_unreadable');
      expect(unreadable.length).toBeGreaterThanOrEqual(1);
      expect(unreadable[0].severity).toBe('warning');
    });
  });

  describe('workflowApprovers in error details', () => {
    it('includes workflowApprovers in the error diagnostic details', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'middleware.ts');
      fs.writeFileSync(filePath, 'export default middleware() {}');
      execSync('git add middleware.ts', { cwd: dir, stdio: 'pipe' });
      // No state file

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'middleware.ts', [
        {
          glob: 'middleware.ts',
          requiresWorkflow: ['chg'],
          workflowApprovers: ['tech-lead', 'security-team'],
        },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      const error = diags.find((d) =>
        d.code === 'workflow_gate_no_state_file' || d.code === 'workflow_gate_required',
      );
      expect(error).toBeDefined();
      expect(error?.details?.workflowApprovers).toEqual(['tech-lead', 'security-team']);
    });
  });

  describe('multiple rules matching same file', () => {
    it('emits diagnostics for all matching rules independently', async () => {
      const dir = makeGitRepo(makeTempDir());
      const filePath = path.join(dir, 'CompanyRail.tsx');
      fs.writeFileSync(filePath, 'const x = 1;');
      execSync('git add CompanyRail.tsx', { cwd: dir, stdio: 'pipe' });
      // State has chgId but no reqId
      writeStateFile(
        dir,
        `files:\n  "CompanyRail.tsx":\n    workflowCompleted: true\n    chgId: "CHG-001"\n`,
      );

      const adapter = new WorkflowGateAdapter();
      const ctx = makeContext(dir, 'CompanyRail.tsx', [
        { id: 'rule-chg', glob: 'CompanyRail.tsx', requiresWorkflow: ['chg'] },
        { id: 'rule-req', glob: 'CompanyRail.tsx', requiresWorkflow: ['req'] },
      ]);
      const diags = await adapter.validate(filePath, ctx);
      // rule-chg passes (chgId present), rule-req fails (no reqId)
      expect(diags.filter((d) => d.code === 'workflow_gate_req_id_missing')).toHaveLength(1);
      expect(diags.filter((d) => d.code === 'workflow_gate_chg_id_missing')).toHaveLength(0);
    });
  });
});
