/**
 * WorkflowGateAdapter — diff-aware validator that blocks commits to controlled
 * files unless a workflow has been completed via `sc workflow controlled modify`.
 *
 * Configuration (added to FileRule in types.ts):
 *   requiresWorkflow?: Array<'chg' | 'req' | 'light'>
 *     - 'chg'   — requires a CHG document (chgId non-empty in state)
 *     - 'req'   — requires a linked requirement (reqId matching REQ-xxx pattern)
 *     - 'light' — requires workflowCompleted=true; emits WARNING not error
 *   workflowApprovers?: string[]  — informational only, shown in error details
 *
 * Reads workflow state from:
 *   <repoRoot>/.supernal/controlled-files-workflow-state.yaml
 *
 * State file schema (per file entry):
 *   files:
 *     "relative/path.ts":
 *       workflowCompleted: true
 *       chgId: "CHG-001"    # required for 'chg' level
 *       reqId: "REQ-XXX-001" # required for 'req' level
 *
 * DIFF-AWARE: The adapter only fires when the file is in the git staging area.
 * Manual `repotype validate` and CI runs have no staged files → adapter skips.
 *
 * BYPASS: SC_ALLOW_CONTROLLED_EDIT=1 emits a warning and allows the commit.
 * This replaces the old SC_ALLOW_CONTROLLED_EDIT=1 in sc workflow controlled
 * pre-commit. The old LOCK_OVERRIDE bypass for locked-patterns.json is retired.
 */

import path from 'node:path';
import fs from 'node:fs';
import yaml from 'js-yaml';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';
import { getStagedFiles, wasGitUnavailable } from './git-staged-cache.js';

const REQ_ID_PATTERN = /^REQ-[A-Z0-9-]+$/;
const STATE_FILE_RELATIVE = path.join('.supernal', 'controlled-files-workflow-state.yaml');

interface WorkflowFileEntry {
  workflowCompleted?: boolean;
  chgId?: string;
  reqId?: string;
}

interface WorkflowState {
  files?: Record<string, WorkflowFileEntry>;
}

// Module-level cache: state file is read at most once per repoRoot per process
const workflowStateCache = new Map<string, WorkflowState | null>();

function getWorkflowState(repoRoot: string, filePath: string): {
  state: WorkflowState | null;
  warning?: Diagnostic;
} {
  if (workflowStateCache.has(repoRoot)) {
    return { state: workflowStateCache.get(repoRoot)! };
  }

  const stateFilePath = path.join(repoRoot, STATE_FILE_RELATIVE);

  if (!fs.existsSync(stateFilePath)) {
    workflowStateCache.set(repoRoot, null);
    return { state: null };
  }

  let parsed: unknown;
  try {
    const raw = fs.readFileSync(stateFilePath, 'utf8');
    parsed = yaml.load(raw);
  } catch {
    const warning: Diagnostic = {
      code: 'workflow_gate_state_unreadable',
      message: `Workflow state file exists but could not be parsed: ${stateFilePath}. Workflow gate checks are skipped.`,
      severity: 'warning',
      file: filePath,
    };
    workflowStateCache.set(repoRoot, null);
    return { state: null, warning };
  }

  if (!parsed || typeof parsed !== 'object') {
    workflowStateCache.set(repoRoot, null);
    return { state: null };
  }

  const state = parsed as WorkflowState;
  workflowStateCache.set(repoRoot, state);
  return { state };
}

export class WorkflowGateAdapter implements ValidatorAdapter {
  id = 'workflow-gate';

  supports(_filePath: string, context: ValidatorContext): boolean {
    return context.ruleSet.fileRules.some(
      (rule) => Array.isArray(rule.requiresWorkflow) && rule.requiresWorkflow.length > 0,
    );
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const relPath = context.ruleSet.filePath;
    const repoRoot = context.repoRoot;

    // Diff-aware gate: only fire when file is staged
    const gitUnavailable = wasGitUnavailable(repoRoot);

    if (gitUnavailable) {
      diagnostics.push({
        code: 'workflow_gate_git_unavailable',
        message: `git index unavailable; workflow gate checks skipped for ${relPath}.`,
        severity: 'warning',
        file: filePath,
      });
      return diagnostics;
    }

    const stagedFiles = getStagedFiles(repoRoot);
    if (!stagedFiles.has(relPath)) {
      // Not staged — skip silently
      return [];
    }

    // Check bypass env var first
    if (process.env.SC_ALLOW_CONTROLLED_EDIT === '1') {
      diagnostics.push({
        code: 'workflow_gate_bypassed',
        message: `SC_ALLOW_CONTROLLED_EDIT=1 is set — workflow gate bypassed for ${relPath}.`,
        severity: 'warning',
        file: filePath,
        details: {
          relPath,
          timestamp: new Date().toISOString(),
          env: 'SC_ALLOW_CONTROLLED_EDIT=1',
        },
      });
      return diagnostics;
    }

    // Load workflow state (cached)
    const stateFilePath = path.join(repoRoot, STATE_FILE_RELATIVE);
    const { state, warning } = getWorkflowState(repoRoot, filePath);

    if (warning) {
      diagnostics.push(warning);
    }

    for (const rule of context.ruleSet.fileRules) {
      if (!Array.isArray(rule.requiresWorkflow) || rule.requiresWorkflow.length === 0) {
        continue;
      }

      const fileEntry = state?.files?.[relPath];
      const workflowCompleted = fileEntry?.workflowCompleted === true;

      for (const level of rule.requiresWorkflow) {
        if (!workflowCompleted) {
          // No completed workflow at all
          if (!state) {
            // State file doesn't exist
            const severity = level === 'light' ? 'warning' : 'error';
            diagnostics.push({
              code: 'workflow_gate_no_state_file',
              message: `${relPath} is a controlled file (level: ${level}) but no workflow state file exists at ${stateFilePath}. Run: sc workflow controlled modify ${relPath}`,
              severity,
              file: filePath,
              ruleId: rule.id,
              details: {
                requiresWorkflow: rule.requiresWorkflow,
                workflowApprovers: rule.workflowApprovers,
                stateFile: stateFilePath,
                hint: `Run: sc workflow controlled modify ${relPath}`,
              },
            });
          } else {
            // State file exists but this file has no completed workflow
            const severity = level === 'light' ? 'warning' : 'error';
            diagnostics.push({
              code: 'workflow_gate_required',
              message: `${relPath} is a controlled file (level: ${level}) but no completed workflow was found. Run: sc workflow controlled modify ${relPath}`,
              severity,
              file: filePath,
              ruleId: rule.id,
              details: {
                requiresWorkflow: rule.requiresWorkflow,
                workflowApprovers: rule.workflowApprovers,
                stateFile: stateFilePath,
                hint: `Run: sc workflow controlled modify ${relPath}`,
              },
            });
          }
        } else {
          // Workflow is completed — validate level-specific requirements
          if (level === 'chg') {
            if (!fileEntry?.chgId || String(fileEntry.chgId).trim() === '') {
              diagnostics.push({
                code: 'workflow_gate_chg_id_missing',
                message: `${relPath} requires a CHG document (requiresWorkflow: chg) but workflowCompleted=true with no chgId. Update the workflow state with a valid chgId.`,
                severity: 'error',
                file: filePath,
                ruleId: rule.id,
                details: {
                  workflowApprovers: rule.workflowApprovers,
                  stateFile: stateFilePath,
                },
              });
            }
          } else if (level === 'req') {
            const reqId = fileEntry?.reqId;
            if (!reqId || !REQ_ID_PATTERN.test(String(reqId))) {
              diagnostics.push({
                code: 'workflow_gate_req_id_missing',
                message: `${relPath} requires a REQ-xxx requirement link (requiresWorkflow: req) but reqId '${reqId ?? '(missing)'}' does not match /^REQ-[A-Z0-9-]+$/. Update the workflow state with a valid reqId.`,
                severity: 'error',
                file: filePath,
                ruleId: rule.id,
                details: {
                  reqId,
                  workflowApprovers: rule.workflowApprovers,
                  stateFile: stateFilePath,
                },
              });
            }
          }
          // 'light' level: workflowCompleted=true is sufficient — no chgId/reqId required
        }
      }
    }

    return diagnostics;
  }
}
