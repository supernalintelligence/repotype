/**
 * cron-registry-drift adapter (req-alluring-gold-easement)
 *
 * Pre-push gate that detects split-brain between what crons each board DECLARES
 * (packages/boards/<id>/board.yaml `crons:`) and what is REGISTERED in the derived
 * runtime registry (.supernal/modules/crons.json → crons[boardId][]).
 *
 * The registry is reconciled from board.yaml on worker startup + on a periodic
 * __system__ cron (see apps/workspace-worker/src/scheduler/CronScheduler.ts).
 * A declared cron that never made it into the registry is silently dark — the
 * exact defect that left the SEO/distribution crons un-scheduled. This rule
 * catches that class of drift before it ships.
 *
 * Rule ID: cron-registry-drift
 *
 * Three classifications:
 *   1. declared-but-unregistered  → cron_declared_but_unregistered → error (DRIFT)
 *        A board.yaml cron with no entry in crons.json for that board.
 *   2. registered-but-undeclared  → cron_registered_but_undeclared → error (ORPHAN)
 *        A source:"yaml" registry entry with no matching board.yaml cron.
 *        Soft-removed (removedFromYaml) and non-yaml-sourced entries are exempt —
 *        they are legitimately registry-only.
 *   3. explicitly-disabled        → cron_explicitly_disabled → warning (SURFACE, not error)
 *        A board.yaml cron declared enabled:false, materialized disabled in the
 *        registry. This is a deliberate, visible "off" — surfaced, never an error.
 *
 * No fallbacks (repo rule): if crons.json is missing or unparseable, the rule
 * emits an error — it never silently passes.
 *
 * This is a REPO-LEVEL rule, not a per-file rule. repotype invokes adapters per
 * scanned file, so the rule self-selects when ANY packages/boards/<id>/board.yaml
 * OR the .supernal/modules/crons.json is in the changeset, then performs the full
 * declared×registered diff over EVERY board. To avoid emitting the same diagnostic
 * once per matched file in a single run, the result is computed once per repo root
 * and memoized for the lifetime of the adapter instance (one engine = one run).
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

const BOARDS_DIR_SEGMENT_FWD = '/packages/boards/';
const CRONS_JSON_SEGMENT_FWD = '/.supernal/modules/crons.json';

/**
 * Directories under packages/boards that the scheduler's reconcile loop excludes.
 * Kept in sync with the EXCLUDED set in
 * apps/workspace-worker/src/scheduler/CronScheduler.ts. A declared cron in one of
 * these dirs is never reconciled into the registry, so it must not be flagged as drift.
 */
const RECONCILE_EXCLUDED = new Set([
  'templates',
  'lib',
  'shared-ui',
  '__planner',
  '__system__',
]);

interface BoardYamlCron {
  id?: string;
  name?: string;
  action?: string;
  enabled?: boolean;
}

interface RegistryCron {
  id: string;
  enabled?: boolean;
  source?: string;
  removedFromYaml?: boolean;
}

interface CronsFile {
  version?: number;
  crons?: Record<string, RegistryCron[]>;
}

function normalize(p: string): string {
  return p.replace(/\\/g, '/');
}

function isBoardYaml(filePath: string): boolean {
  const n = normalize(filePath);
  return n.includes(BOARDS_DIR_SEGMENT_FWD) && n.endsWith('/board.yaml');
}

function isCronsJson(filePath: string): boolean {
  return normalize(filePath).endsWith(CRONS_JSON_SEGMENT_FWD);
}

/** The canonical cron id, matching the scheduler's `id ?? name ?? action` precedence. */
function cronId(c: BoardYamlCron): string | undefined {
  return c.id ?? c.name ?? c.action;
}

/**
 * Resolve the monorepo root from a matched file path. For a board.yaml the root
 * is the ancestor directly above `packages/boards/`; for crons.json it is the
 * ancestor directly above `.supernal/modules/`. Falls back to context.repoRoot.
 */
function resolveMonorepoRoot(filePath: string, context: ValidatorContext): string {
  const n = normalize(filePath);
  const boardsIdx = n.indexOf(BOARDS_DIR_SEGMENT_FWD);
  if (boardsIdx >= 0) return n.slice(0, boardsIdx);
  const cronsIdx = n.indexOf('/.supernal/modules/crons.json');
  if (cronsIdx >= 0) return n.slice(0, cronsIdx);
  return context.repoRoot;
}

export class CronRegistryDriftAdapter implements ValidatorAdapter {
  id = 'cron-registry-drift';

  /** Memoized results keyed by monorepo root — the diff runs at most once per root per run. */
  private cache = new Map<string, Diagnostic[]>();

  supports(filePath: string, _context: ValidatorContext): boolean {
    return isBoardYaml(filePath) || isCronsJson(filePath);
  }

  async validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]> {
    const root = resolveMonorepoRoot(filePath, context);
    const cached = this.cache.get(root);
    if (cached) return [];
    const diagnostics = this.computeDrift(root);
    this.cache.set(root, diagnostics);
    return diagnostics;
  }

  /** The pure declared×registered diff over every board under packages/boards/. */
  private computeDrift(monorepoRoot: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const cronsJsonPath = path.join(monorepoRoot, '.supernal', 'modules', 'crons.json');

    // ── Load the registry — NO fallback. Missing/unparseable is a loud error. ──
    if (!fs.existsSync(cronsJsonPath)) {
      return [
        {
          code: 'cron_registry_missing',
          message: `.supernal/modules/crons.json does not exist — cannot verify cron declaration/registration drift. The registry is required.`,
          severity: 'error',
          file: cronsJsonPath,
          ruleId: this.id,
        },
      ];
    }

    let registry: CronsFile;
    try {
      registry = JSON.parse(fs.readFileSync(cronsJsonPath, 'utf8')) as CronsFile;
    } catch (err) {
      return [
        {
          code: 'cron_registry_unparseable',
          message: `.supernal/modules/crons.json could not be parsed: ${(err as Error).message}`,
          severity: 'error',
          file: cronsJsonPath,
          ruleId: this.id,
        },
      ];
    }

    const registryCrons = registry.crons ?? {};

    // ── Enumerate declared crons from every board.yaml under packages/boards/ ──
    const boardsDir = path.join(monorepoRoot, 'packages', 'boards');
    let boardDirs: string[];
    try {
      boardDirs = fs
        .readdirSync(boardsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
    } catch {
      // No boards dir under this root — nothing declared, so no drift to report.
      boardDirs = [];
    }

    // declaredByBoard: boardId → Map<cronId, { enabled }>
    const declaredByBoard = new Map<string, Map<string, { enabled: boolean }>>();

    for (const boardId of boardDirs) {
      if (RECONCILE_EXCLUDED.has(boardId)) continue;
      const yamlPath = path.join(boardsDir, boardId, 'board.yaml');
      if (!fs.existsSync(yamlPath)) continue;

      let doc: { crons?: BoardYamlCron[] };
      try {
        const parsed = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
        doc = (typeof parsed === 'object' && parsed !== null ? parsed : {}) as {
          crons?: BoardYamlCron[];
        };
      } catch {
        // A malformed board.yaml is caught by board-yaml-completeness-adapter — skip here.
        continue;
      }

      const declared = new Map<string, { enabled: boolean }>();
      for (const c of doc.crons ?? []) {
        const id = cronId(c);
        if (!id) continue;
        declared.set(id, { enabled: c.enabled ?? true });
      }
      declaredByBoard.set(boardId, declared);

      // ── Classify each declared cron against the registry ──
      const registryList = registryCrons[boardId] ?? [];
      const registryById = new Map(registryList.map((r) => [r.id, r]));

      for (const [id, { enabled }] of declared) {
        const reg = registryById.get(id);
        if (!reg) {
          // (1) DRIFT — declared but no registry entry at all.
          diagnostics.push({
            code: 'cron_declared_but_unregistered',
            message:
              `Cron ${boardId}/${id} is declared in board.yaml but has no entry in ` +
              `.supernal/modules/crons.json — it will never be scheduled (silent drift). ` +
              `Run the workspace-worker reconcile (or restart it) to register it.`,
            severity: 'error',
            file: yamlPath,
            ruleId: this.id,
            details: { boardId, cronId: id },
          });
          continue;
        }
        // (3) explicitly-disabled — surfaced, not an error.
        if (enabled === false) {
          diagnostics.push({
            code: 'cron_explicitly_disabled',
            message:
              `Cron ${boardId}/${id} is explicitly disabled (board.yaml enabled:false, ` +
              `registry enabled:${reg.enabled === false ? 'false' : 'true'}). ` +
              `Surfaced so "off" is always a visible, deliberate decision.`,
            severity: 'warning',
            file: yamlPath,
            ruleId: this.id,
            details: { boardId, cronId: id },
          });
        }
      }
    }

    // ── (2) ORPHAN — yaml-sourced registry entries with no matching board.yaml cron ──
    for (const [boardId, registryList] of Object.entries(registryCrons)) {
      if (RECONCILE_EXCLUDED.has(boardId)) continue;
      const declared = declaredByBoard.get(boardId);
      const cronsJsonRel = path.join(monorepoRoot, '.supernal', 'modules', 'crons.json');
      for (const reg of registryList) {
        // Only yaml-sourced entries are reconciled from board.yaml; non-yaml
        // (e.g. manual/runtime) entries are legitimately registry-only.
        if (reg.source !== 'yaml') continue;
        // Soft-removed entries are an intentional, audited registry-only state.
        if (reg.removedFromYaml) continue;
        const stillDeclared = declared?.has(reg.id) ?? false;
        if (!stillDeclared) {
          diagnostics.push({
            code: 'cron_registered_but_undeclared',
            message:
              `Cron ${boardId}/${reg.id} is registered (source:"yaml") in ` +
              `.supernal/modules/crons.json but is not declared in ` +
              `packages/boards/${boardId}/board.yaml — orphaned registry entry. ` +
              `Remove it from the registry or re-declare it in board.yaml.`,
            severity: 'error',
            file: cronsJsonRel,
            ruleId: this.id,
            details: { boardId, cronId: reg.id },
          });
        }
      }
    }

    return diagnostics;
  }
}
