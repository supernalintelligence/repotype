/**
 * skill-best-practices adapter
 *
 * Enforces Agent Skill authoring best-practices on every Agent Skill manifest —
 * the `skills/<id>/SKILL.md` files that live one level under a `skills/` directory.
 * Encodes the guidance from https://github.com/mgechev/skills-best-practices.
 *
 * Rule ID: skill-best-practices
 *
 * Fires on: SKILL.md files exactly one level under a `skills/` directory
 *   (i.e. `.../skills/<id>/SKILL.md`). A SKILL.md nested deeper (e.g.
 *   `skills/<id>/sub/SKILL.md`) is NOT a skill manifest and is ignored.
 *
 * Checks:
 *  1. SKILL.md is non-empty (0-byte file). Violation: error.
 *  2. Has YAML frontmatter (a leading `---` block). Violation: error.
 *  3. `name:` field present and equals the parent directory name. Charset:
 *     standalone skills must match `^[a-z0-9]+(-[a-z0-9]+)*$` (lowercase/digits/
 *     hyphens, no consecutive/leading/trailing hyphen). BOARD-skills — a
 *     `skills/<id>` that mirrors an existing `packages/boards/<id>` — may also
 *     use underscores (`^[a-z0-9_][a-z0-9_-]*$`), because a board `id` doubles as
 *     its SQLite table prefix (`<id>_*`) and hyphens are invalid in SQL
 *     identifiers (e.g. `opportunity_board`, `aria_overview`, `__planner`).
 *     Violation: error.
 *  4. `description:` field present and <= 1024 characters. Violation: error.
 *  5. SKILL.md <= 500 lines. Violation: warning (not error).
 *
 * Unknown frontmatter fields are silently allowed (forward compatibility).
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseMarkdownContent } from '../core/markdown.js';
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from '../core/types.js';

/** Matches `.../skills/<id>/SKILL.md` where <id> is a single path segment. */
const SKILL_MANIFEST_RE = /(?:^|\/)skills\/([^/]+)\/SKILL\.md$/;

/** Slug shape for a standalone skill name: lowercase/digits, single hyphens between groups. */
const SKILL_NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Relaxed shape for a BOARD-skill name: lowercase/digits/underscores/hyphens.
 * A board `id` doubles as its SQLite table prefix (`<id>_*`), and hyphens are
 * invalid in SQL identifiers, so board-skills legitimately use underscores
 * (and the `__`-prefix convention for catalog-hidden boards like `__planner`).
 */
const BOARD_SKILL_NAME_RE = /^[a-z0-9_][a-z0-9_-]*$/;

const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_LINES = 500;

function skillDirFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(SKILL_MANIFEST_RE);
  return match ? match[1] : path.basename(path.dirname(filePath));
}

/**
 * A skill is a "board-skill" when a sibling `packages/boards/<id>` exists at the
 * repo root (the path segment before `/skills/`). Board-skills mirror a board
 * package whose `id` is also a SQL table prefix, so they may use underscores.
 */
function isBoardSkill(filePath: string, skillDir: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const idx = normalized.lastIndexOf('/skills/');
  if (idx < 0) return false;
  const repoRoot = normalized.slice(0, idx);
  try {
    return fs.existsSync(path.join(repoRoot, 'packages', 'boards', skillDir));
  } catch {
    return false;
  }
}

export class SkillBestPracticesAdapter implements ValidatorAdapter {
  id = 'skill-best-practices';

  supports(filePath: string, _context: ValidatorContext): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    return SKILL_MANIFEST_RE.test(normalized);
  }

  async validate(filePath: string, _context: ValidatorContext): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const skillDir = skillDirFromPath(filePath);

    let raw: string;
    try {
      raw = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      return [
        {
          code: 'skill_md_unreadable',
          message: `SKILL.md could not be read: ${(err as Error).message}`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
        },
      ];
    }

    // Check 1: non-empty (0-byte file).
    if (raw.length === 0) {
      return [
        {
          code: 'skill_md_empty',
          message: `SKILL.md for skill '${skillDir}' is empty. A skill manifest must have frontmatter and a body.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { skill: skillDir },
        },
      ];
    }

    // Check 2: has YAML frontmatter (a leading `---` block).
    const hasFrontmatter = /^---\r?\n[\s\S]*?\r?\n---/.test(raw);
    if (!hasFrontmatter) {
      diagnostics.push({
        code: 'skill_md_missing_frontmatter',
        message: `SKILL.md for skill '${skillDir}' has no YAML frontmatter. Start the file with a '---' block containing at least 'name' and 'description'.`,
        severity: 'error',
        file: filePath,
        ruleId: this.id,
        details: { skill: skillDir },
      });
      // Without frontmatter we cannot evaluate name/description; still run the line check below.
    }

    let frontmatter: Record<string, unknown> = {};
    if (hasFrontmatter) {
      try {
        frontmatter = parseMarkdownContent(raw).frontmatter;
      } catch (err) {
        diagnostics.push({
          code: 'skill_md_invalid_frontmatter',
          message: `SKILL.md for skill '${skillDir}' has invalid YAML frontmatter: ${(err as Error).message}`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { skill: skillDir },
        });
      }

      // Check 3: name present, equals parent dir, matches slug shape.
      const name = frontmatter['name'];
      if (name === undefined || name === null || name === '') {
        diagnostics.push({
          code: 'skill_md_missing_name',
          message: `SKILL.md for skill '${skillDir}' must have a 'name' field in its frontmatter.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { skill: skillDir },
        });
      } else if (typeof name !== 'string') {
        diagnostics.push({
          code: 'skill_md_name_not_string',
          message: `SKILL.md for skill '${skillDir}' has a non-string 'name' field.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { skill: skillDir, name },
        });
      } else {
        const boardSkill = isBoardSkill(filePath, skillDir);
        const nameOk = boardSkill ? BOARD_SKILL_NAME_RE.test(name) : SKILL_NAME_RE.test(name);
        if (!nameOk) {
          diagnostics.push({
            code: 'skill_md_name_invalid_format',
            message: boardSkill
              ? `SKILL.md 'name' ("${name}") must be lowercase letters, digits, underscores, and hyphens only.`
              : `SKILL.md 'name' ("${name}") must be lowercase letters, digits, and single hyphens only (no leading, trailing, or consecutive hyphens). If this mirrors a board package, add packages/boards/${skillDir}.`,
            severity: 'error',
            file: filePath,
            ruleId: this.id,
            details: { skill: skillDir, name, boardSkill },
          });
        }
        if (name !== skillDir) {
          diagnostics.push({
            code: 'skill_md_name_dir_mismatch',
            message: `SKILL.md 'name' ("${name}") does not match its parent directory name ("${skillDir}").`,
            severity: 'error',
            file: filePath,
            ruleId: this.id,
            details: { skill: skillDir, name },
          });
        }
      }

      // Check 4: description present and <= 1024 chars.
      const description = frontmatter['description'];
      if (description === undefined || description === null || description === '') {
        diagnostics.push({
          code: 'skill_md_missing_description',
          message: `SKILL.md for skill '${skillDir}' must have a non-empty 'description' field in its frontmatter.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { skill: skillDir },
        });
      } else if (typeof description !== 'string') {
        diagnostics.push({
          code: 'skill_md_description_not_string',
          message: `SKILL.md for skill '${skillDir}' has a non-string 'description' field.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { skill: skillDir },
        });
      } else if (description.length > MAX_DESCRIPTION_LENGTH) {
        diagnostics.push({
          code: 'skill_md_description_too_long',
          message: `SKILL.md 'description' for skill '${skillDir}' is ${description.length} characters (max ${MAX_DESCRIPTION_LENGTH}). Shorten it.`,
          severity: 'error',
          file: filePath,
          ruleId: this.id,
          details: { skill: skillDir, length: description.length, max: MAX_DESCRIPTION_LENGTH },
        });
      }
    }

    // Check 5: <= 500 lines (warning).
    const lineCount = raw.split('\n').length;
    if (lineCount > MAX_LINES) {
      diagnostics.push({
        code: 'skill_md_too_long',
        message: `SKILL.md for skill '${skillDir}' is ${lineCount} lines (recommended max ${MAX_LINES}). Split supporting detail into referenced files to keep the manifest scannable.`,
        severity: 'warning',
        file: filePath,
        ruleId: this.id,
        details: { skill: skillDir, lines: lineCount, max: MAX_LINES },
      });
    }

    return diagnostics;
  }
}
