/**
 * company-yaml adapter
 *
 * Validates .supernal/company.yaml for the required `identity` and `eligibility`
 * sections. Runs whenever the file path ends with `.supernal/company.yaml`.
 *
 * Checks:
 *  1. identity.one_liner exists and is <= 140 chars
 *  2. identity.website is a valid URL
 *  3. identity.founded_year is a 4-digit integer
 *  4. identity.stage is one of: pre-seed, seed, series-a, series-b, growth
 *  5. eligibility.us_entity is a boolean
 *  6. eligibility.accepts_equity is a boolean
 */

import fs from 'node:fs';
import yaml from 'js-yaml';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

const VALID_STAGES = new Set(['pre-seed', 'seed', 'series-a', 'series-b', 'growth']);

function isValidUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function is4DigitInt(value: unknown): boolean {
  if (typeof value !== 'number' || !Number.isInteger(value)) return false;
  return value >= 1000 && value <= 9999;
}

export class CompanyYamlAdapter implements ValidatorAdapter {
  id = 'company-yaml';

  supports(filePath: string, _context: ValidatorContext): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    return normalized.endsWith('.supernal/company.yaml');
  }

  async validate(filePath: string, _context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    let raw: string;
    try {
      raw = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      return [
        {
          code: 'company_yaml_unreadable',
          message: `company.yaml could not be read: ${(err as Error).message}`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        },
      ];
    }

    let doc: unknown;
    try {
      doc = yaml.load(raw);
    } catch (err) {
      return [
        {
          code: 'company_yaml_invalid_syntax',
          message: `company.yaml has invalid YAML syntax: ${(err as Error).message}`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        },
      ];
    }

    if (typeof doc !== 'object' || doc === null) {
      return [
        {
          code: 'company_yaml_not_object',
          message: 'company.yaml must be a YAML mapping at the top level.',
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        },
      ];
    }

    const root = doc as Record<string, unknown>;

    // ── Section: identity ──────────────────────────────────────────────────────

    const identity = root.identity;

    if (typeof identity !== 'object' || identity === null) {
      diagnostics.push({
        code: 'company_yaml_missing_identity',
        message: 'company.yaml is missing the required `identity` section.',
        severity: 'error',
        file: filePath,
        ruleId: this.id,
      });
    } else {
      const id = identity as Record<string, unknown>;

      // Check 1: one_liner
      const oneLiner = id.one_liner;
      if (typeof oneLiner !== 'string' || oneLiner.trim().length === 0) {
        diagnostics.push({
          code: 'company_yaml_missing_one_liner',
          message: 'identity.one_liner must be a non-empty string.',
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        });
      } else if (oneLiner.length > 140) {
        diagnostics.push({
          code: 'company_yaml_one_liner_too_long',
          message: `identity.one_liner is ${oneLiner.length} chars — must be <= 140.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { hint: 'Shorten the one-liner to 140 characters or fewer.' },
        });
      }

      // Check 2: website
      if (!isValidUrl(id.website)) {
        diagnostics.push({
          code: 'company_yaml_invalid_website',
          message: `identity.website must be a valid URL (got: ${String(id.website)}).`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { hint: 'Use a full URL including scheme, e.g. https://example.com' },
        });
      }

      // Check 3: founded_year
      if (!is4DigitInt(id.founded_year)) {
        diagnostics.push({
          code: 'company_yaml_invalid_founded_year',
          message: `identity.founded_year must be a 4-digit integer (got: ${String(id.founded_year)}).`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        });
      }

      // Check 4: stage
      if (typeof id.stage !== 'string' || !VALID_STAGES.has(id.stage)) {
        diagnostics.push({
          code: 'company_yaml_invalid_stage',
          message: `identity.stage must be one of: ${[...VALID_STAGES].join(', ')} (got: ${String(id.stage)}).`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        });
      }
    }

    // ── Section: eligibility ───────────────────────────────────────────────────

    const eligibility = root.eligibility;

    if (typeof eligibility !== 'object' || eligibility === null) {
      diagnostics.push({
        code: 'company_yaml_missing_eligibility',
        message: 'company.yaml is missing the required `eligibility` section.',
        severity: 'error',
        file: filePath,
        ruleId: this.id,
      });
    } else {
      const elig = eligibility as Record<string, unknown>;

      // Check 5: us_entity
      if (typeof elig.us_entity !== 'boolean') {
        diagnostics.push({
          code: 'company_yaml_invalid_us_entity',
          message: `eligibility.us_entity must be a boolean (got: ${String(elig.us_entity)}).`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        });
      }

      // Check 6: accepts_equity
      if (typeof elig.accepts_equity !== 'boolean') {
        diagnostics.push({
          code: 'company_yaml_invalid_accepts_equity',
          message: `eligibility.accepts_equity must be a boolean (got: ${String(elig.accepts_equity)}).`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        });
      }
    }

    return diagnostics;
  }
}
