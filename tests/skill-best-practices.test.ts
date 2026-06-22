import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, afterEach } from 'vitest';
import { SkillBestPracticesAdapter } from '../src/adapters/skill-best-practices-adapter.js';
import type { ValidatorContext } from '../src/core/types.js';

function makeSkill(base: string, skillName: string, content: string): string {
  const skillDir = path.join(base, 'skills', skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  const skillMd = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(skillMd, content);
  return skillMd;
}

function makeContext(): ValidatorContext {
  return {} as ValidatorContext;
}

function codes(diagnostics: { code: string }[]): string[] {
  return diagnostics.map((d) => d.code);
}

describe('SkillBestPracticesAdapter', () => {
  const adapter = new SkillBestPracticesAdapter();
  const tmpDirs: string[] = [];

  afterEach(() => {
    for (const dir of tmpDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tmpDirs.length = 0;
  });

  function tmp(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repotype-skill-test-'));
    tmpDirs.push(dir);
    return dir;
  }

  // ── supports() scoping ────────────────────────────────────────────────
  it('supports SKILL.md exactly one level under skills/', () => {
    const base = tmp();
    const skillMd = makeSkill(base, 'my-skill', '---\nname: my-skill\ndescription: x\n---\nbody\n');
    expect(adapter.supports(skillMd, makeContext())).toBe(true);
  });

  it('ignores SKILL.md nested deeper than one level under skills/', () => {
    const base = tmp();
    const deep = path.join(base, 'skills', 'my-skill', 'sub', 'SKILL.md');
    fs.mkdirSync(path.dirname(deep), { recursive: true });
    fs.writeFileSync(deep, 'x');
    expect(adapter.supports(deep, makeContext())).toBe(false);
  });

  it('ignores SKILL.md not under a skills/ directory', () => {
    const base = tmp();
    const other = path.join(base, 'packages', 'my-skill', 'SKILL.md');
    fs.mkdirSync(path.dirname(other), { recursive: true });
    fs.writeFileSync(other, 'x');
    expect(adapter.supports(other, makeContext())).toBe(false);
  });

  it('ignores non-SKILL.md files under skills/', () => {
    const base = tmp();
    const readme = path.join(base, 'skills', 'my-skill', 'README.md');
    fs.mkdirSync(path.dirname(readme), { recursive: true });
    fs.writeFileSync(readme, 'x');
    expect(adapter.supports(readme, makeContext())).toBe(false);
  });

  // ── Check 1: empty file ───────────────────────────────────────────────
  it('errors on a 0-byte SKILL.md', async () => {
    const base = tmp();
    const skillMd = makeSkill(base, 'empty-skill', '');
    const diagnostics = await adapter.validate(skillMd, makeContext());
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe('skill_md_empty');
    expect(diagnostics[0].severity).toBe('error');
  });

  // ── Check 2: missing frontmatter ──────────────────────────────────────
  it('errors when frontmatter is missing', async () => {
    const base = tmp();
    const skillMd = makeSkill(base, 'no-fm', '# Just a heading\n\nNo frontmatter here.\n');
    const diagnostics = await adapter.validate(skillMd, makeContext());
    expect(codes(diagnostics)).toContain('skill_md_missing_frontmatter');
    expect(diagnostics.find((d) => d.code === 'skill_md_missing_frontmatter')?.severity).toBe('error');
  });

  // ── Check 3: name mismatch ────────────────────────────────────────────
  it('errors when name does not equal the parent directory', async () => {
    const base = tmp();
    const skillMd = makeSkill(base, 'real-dir', '---\nname: other-name\ndescription: x\n---\nbody\n');
    const diagnostics = await adapter.validate(skillMd, makeContext());
    expect(codes(diagnostics)).toContain('skill_md_name_dir_mismatch');
    expect(diagnostics.find((d) => d.code === 'skill_md_name_dir_mismatch')?.severity).toBe('error');
  });

  it('errors when name is missing', async () => {
    const base = tmp();
    const skillMd = makeSkill(base, 'nameless', '---\ndescription: x\n---\nbody\n');
    const diagnostics = await adapter.validate(skillMd, makeContext());
    expect(codes(diagnostics)).toContain('skill_md_missing_name');
  });

  // ── Check 3: bad charset ──────────────────────────────────────────────
  it('errors when name has an invalid charset (uppercase / underscore / trailing hyphen)', async () => {
    const cases = ['Bad_Name', 'bad-', '-bad', 'bad--name', 'Bad'];
    for (const badName of cases) {
      const base = tmp();
      // Directory name must equal the bad name so the only failure is charset.
      const skillMd = makeSkill(base, badName, `---\nname: ${badName}\ndescription: x\n---\nbody\n`);
      const diagnostics = await adapter.validate(skillMd, makeContext());
      expect(codes(diagnostics)).toContain('skill_md_name_invalid_format');
      expect(diagnostics.find((d) => d.code === 'skill_md_name_invalid_format')?.severity).toBe('error');
    }
  });

  // ── Check 4: description ──────────────────────────────────────────────
  it('errors when description is missing', async () => {
    const base = tmp();
    const skillMd = makeSkill(base, 'no-desc', '---\nname: no-desc\n---\nbody\n');
    const diagnostics = await adapter.validate(skillMd, makeContext());
    expect(codes(diagnostics)).toContain('skill_md_missing_description');
  });

  it('errors when description exceeds 1024 chars', async () => {
    const base = tmp();
    const longDesc = 'a'.repeat(1025);
    const skillMd = makeSkill(base, 'long-desc', `---\nname: long-desc\ndescription: "${longDesc}"\n---\nbody\n`);
    const diagnostics = await adapter.validate(skillMd, makeContext());
    const d = diagnostics.find((x) => x.code === 'skill_md_description_too_long');
    expect(d).toBeDefined();
    expect(d?.severity).toBe('error');
  });

  it('accepts a description of exactly 1024 chars', async () => {
    const base = tmp();
    const desc = 'a'.repeat(1024);
    const skillMd = makeSkill(base, 'edge-desc', `---\nname: edge-desc\ndescription: "${desc}"\n---\nbody\n`);
    const diagnostics = await adapter.validate(skillMd, makeContext());
    expect(codes(diagnostics)).not.toContain('skill_md_description_too_long');
  });

  // ── Check 5: oversized (warning, not error) ───────────────────────────
  it('warns (does not error) when SKILL.md exceeds 500 lines', async () => {
    const base = tmp();
    const body = Array.from({ length: 520 }, (_, i) => `line ${i}`).join('\n');
    const skillMd = makeSkill(base, 'big-skill', `---\nname: big-skill\ndescription: x\n---\n${body}\n`);
    const diagnostics = await adapter.validate(skillMd, makeContext());
    const d = diagnostics.find((x) => x.code === 'skill_md_too_long');
    expect(d).toBeDefined();
    expect(d?.severity).toBe('warning');
    // No error-severity diagnostics for an otherwise-valid oversized skill.
    expect(diagnostics.filter((x) => x.severity === 'error')).toHaveLength(0);
  });

  // ── Passing case ──────────────────────────────────────────────────────
  it('passes a well-formed SKILL.md', async () => {
    const base = tmp();
    const skillMd = makeSkill(
      base,
      'good-skill',
      '---\nname: good-skill\ndescription: A concise, valid description.\n---\n\n# Good Skill\n\nBody content.\n'
    );
    const diagnostics = await adapter.validate(skillMd, makeContext());
    expect(diagnostics).toHaveLength(0);
  });
});
