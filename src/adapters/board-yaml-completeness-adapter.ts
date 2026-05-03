/**
 * REQ-MLM-016: board-yaml-completeness adapter
 *
 * Lints all board.yaml files in packages/boards/ and .supernal/boards/.
 * Rule ID: board-yaml-completeness
 * Severity: warning (not error) — boards with no connectors/crons/secrets are valid.
 *
 * Checks (spec Section 5.1):
 *  1. id MUST be present and MUST match the directory name. Violation: error.
 *  2. label MUST be present. Violation: error.
 *  3. description MUST be present and non-empty (length > 0). Violation: error.
 *  4. category MUST be present. Violation: warning.
 *  5. icon MUST be present. Violation: warning.
 *  6. If connectors, crons, AND secrets are all absent: informational note (suggestion).
 *  7. Each connector item MUST have id, label, and auth. Missing any: warning.
 *     NOTE: board.yaml uses two connector formats —
 *       - new format: connectors as array with { id, label, auth }
 *       - legacy format: connectors as { default, supported } object
 *     We lint only the new array format; legacy format is silently allowed.
 *  8. Each secret item MUST have key and label. Missing any: warning.
 *  9. Each cron item MUST have id, schedule, action, and description. Missing any: warning.
 *
 * Unknown fields are silently allowed (forward compatibility).
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

function isBoardYaml(filePath: string): boolean {
  return filePath.endsWith('/board.yaml') || filePath === 'board.yaml';
}

export class BoardYamlCompletenessAdapter implements ValidatorAdapter {
  id = 'board-yaml-completeness';

  supports(filePath: string, _context: ValidatorContext): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    return isBoardYaml(normalized);
  }

  async validate(filePath: string, _context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    let raw: string;
    try {
      raw = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      return [
        {
          code: 'board_yaml_unreadable',
          message: `board.yaml could not be read: ${(err as Error).message}`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        },
      ];
    }

    let doc: Record<string, unknown>;
    try {
      const parsed = yaml.load(raw);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return [
          {
            code: 'board_yaml_not_object',
            message: 'board.yaml must be a YAML mapping (object), not a scalar or array.',
            severity: 'error',
            file: filePath,
            ruleId: this.id,
          },
        ];
      }
      doc = parsed as Record<string, unknown>;
    } catch (err) {
      return [
        {
          code: 'board_yaml_invalid_yaml',
          message: `board.yaml has invalid YAML syntax: ${(err as Error).message}`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        },
      ];
    }

    // Check 1: id MUST be present and MUST match the directory name.
    const dirName = path.basename(path.dirname(filePath));
    if (!('id' in doc) || doc['id'] === undefined || doc['id'] === null || doc['id'] === '') {
      diagnostics.push({
        code: 'board_yaml_missing_id',
        message: 'board.yaml must have an id field.',
        severity: 'error',
        file: filePath,
        ruleId: this.id,
      });
    } else if (typeof doc['id'] === 'string' && doc['id'] !== dirName) {
      diagnostics.push({
        code: 'board_yaml_id_mismatch',
        message: `board.yaml id "${doc['id']}" does not match directory name "${dirName}".`,
        severity: 'error',
        file: filePath,
        ruleId: this.id,
        details: { id: doc['id'], dirName },
      });
    }

    // Check 2: label MUST be present.
    if (!('label' in doc) || doc['label'] === undefined || doc['label'] === null || doc['label'] === '') {
      diagnostics.push({
        code: 'board_yaml_missing_label',
        message: 'board.yaml must have a label field.',
        severity: 'error',
        file: filePath,
        ruleId: this.id,
      });
    }

    // Check 3: description MUST be present and non-empty.
    if (!('description' in doc) || doc['description'] === undefined || doc['description'] === null) {
      diagnostics.push({
        code: 'board_yaml_missing_description',
        message: 'board.yaml must have a description field.',
        severity: 'error',
        file: filePath,
        ruleId: this.id,
      });
    } else if (typeof doc['description'] === 'string' && doc['description'].trim().length === 0) {
      diagnostics.push({
        code: 'board_yaml_empty_description',
        message: 'board.yaml description must not be empty.',
        severity: 'error',
        file: filePath,
        ruleId: this.id,
      });
    }

    // Check 4: category SHOULD be present. Violation: warning.
    if (!('category' in doc) || doc['category'] === undefined || doc['category'] === null || doc['category'] === '') {
      diagnostics.push({
        code: 'board_yaml_missing_category',
        message: 'board.yaml should have a category field (revenue | operations | intelligence | content | custom).',
        severity: 'warning',
        file: filePath,
        ruleId: this.id,
      });
    }

    // Check 5: icon SHOULD be present. Violation: warning.
    if (!('icon' in doc) || doc['icon'] === undefined || doc['icon'] === null || doc['icon'] === '') {
      diagnostics.push({
        code: 'board_yaml_missing_icon',
        message: 'board.yaml should have an icon field (lucide icon name).',
        severity: 'warning',
        file: filePath,
        ruleId: this.id,
      });
    }

    // Check 6: If connectors, crons, AND secrets are all absent: informational note.
    const hasConnectors = 'connectors' in doc && doc['connectors'] !== undefined && doc['connectors'] !== null;
    const hasCrons = 'crons' in doc && doc['crons'] !== undefined && doc['crons'] !== null;
    const hasSecrets = 'secrets' in doc && doc['secrets'] !== undefined && doc['secrets'] !== null;

    if (!hasConnectors && !hasCrons && !hasSecrets) {
      diagnostics.push({
        code: 'board_yaml_no_external_deps',
        message:
          'board.yaml declares no connectors, crons, or secrets — agent will have nothing to schedule or connect. ' +
          'Add connectors/crons/secrets sections or this note is expected for utility boards.',
        severity: 'suggestion',
        file: filePath,
        ruleId: this.id,
      });
    }

    // Check 7: Each connector item in new array format MUST have id, label, and auth.
    // Legacy format ({ default, supported }) is silently allowed.
    if (hasConnectors && Array.isArray(doc['connectors'])) {
      const connectors = doc['connectors'] as Array<unknown>;
      for (let i = 0; i < connectors.length; i++) {
        const c = connectors[i];
        if (typeof c !== 'object' || c === null || Array.isArray(c)) continue;
        const connector = c as Record<string, unknown>;
        const missing: string[] = [];
        if (!connector['id']) missing.push('id');
        if (!connector['label']) missing.push('label');
        if (!connector['auth']) missing.push('auth');
        if (missing.length > 0) {
          diagnostics.push({
            code: 'board_yaml_connector_missing_fields',
            message: `connectors[${i}] is missing required fields: ${missing.join(', ')}.`,
            severity: 'warning',
            file: filePath,
            ruleId: this.id,
            details: { index: i, missing },
          });
        }
      }
    }

    // Check 8: Each secret item MUST have key and label.
    if (hasSecrets && Array.isArray(doc['secrets'])) {
      const secrets = doc['secrets'] as Array<unknown>;
      for (let i = 0; i < secrets.length; i++) {
        const s = secrets[i];
        if (typeof s !== 'object' || s === null || Array.isArray(s)) continue;
        const secret = s as Record<string, unknown>;
        const missing: string[] = [];
        if (!secret['key']) missing.push('key');
        if (!secret['label']) missing.push('label');
        if (missing.length > 0) {
          diagnostics.push({
            code: 'board_yaml_secret_missing_fields',
            message: `secrets[${i}] is missing required fields: ${missing.join(', ')}.`,
            severity: 'warning',
            file: filePath,
            ruleId: this.id,
            details: { index: i, missing },
          });
        }
      }
    }

    // Check 9: Each cron item MUST have id, schedule, action, and description.
    if (hasCrons && Array.isArray(doc['crons'])) {
      const crons = doc['crons'] as Array<unknown>;
      for (let i = 0; i < crons.length; i++) {
        const cr = crons[i];
        if (typeof cr !== 'object' || cr === null || Array.isArray(cr)) continue;
        const cron = cr as Record<string, unknown>;
        const missing: string[] = [];
        if (!cron['id']) missing.push('id');
        if (!cron['schedule']) missing.push('schedule');
        if (!cron['action']) missing.push('action');
        if (!cron['description']) missing.push('description');
        if (missing.length > 0) {
          diagnostics.push({
            code: 'board_yaml_cron_missing_fields',
            message: `crons[${i}] is missing required fields: ${missing.join(', ')}.`,
            severity: 'warning',
            file: filePath,
            ruleId: this.id,
            details: { index: i, missing },
          });
        }
      }
    }

    return diagnostics;
  }
}
