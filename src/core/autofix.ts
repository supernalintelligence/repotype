import fs from 'node:fs';
import type { AutofixAction, FixResult } from './types.js';
import { parseMarkdownContent, serializeMarkdown } from './markdown.js';

function applyToFile(file: string, action: AutofixAction): boolean {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = parseMarkdownContent(raw);
  let body = parsed.body || '';
  const frontmatter = parsed.frontmatter || {};

  if (action.type === 'add_frontmatter_field') {
    const key = String(action.payload.key || '');
    if (!key || Object.hasOwn(frontmatter, key)) {
      return false;
    }
    frontmatter[key] = action.payload.value;
  }

  if (action.type === 'add_section') {
    const section = String(action.payload.section || '');
    if (!section || body.includes(`## ${section}`)) {
      return false;
    }
    body = `${body.trimEnd()}\n\n## ${section}\n\n`;
  }

  if (action.type === 'remove_template_hint') {
    const hint = String(action.payload.hint || '');
    if (!hint || !body.includes(hint)) {
      return false;
    }
    body = body.replaceAll(hint, '');
  }

  fs.writeFileSync(file, serializeMarkdown(frontmatter, body));
  return true;
}

export function applyAutofixes(actions: AutofixAction[]): FixResult {
  let applied = 0;
  const diagnostics: FixResult['diagnostics'] = [];

  for (const action of actions) {
    if (!action.safe) {
      continue;
    }

    const ok = applyToFile(action.file, action);
    if (ok) {
      applied += 1;
    }
  }

  return {
    applied,
    diagnostics,
  };
}
