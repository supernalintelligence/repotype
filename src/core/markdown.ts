import fs from 'node:fs';
import yaml from 'js-yaml';

export interface ParsedMarkdown {
  frontmatter: Record<string, unknown>;
  body: string;
  raw: string;
}

export function parseMarkdown(filePath: string): ParsedMarkdown {
  const raw = fs.readFileSync(filePath, 'utf8');
  return parseMarkdownContent(raw);
}

export function parseMarkdownContent(raw: string): ParsedMarkdown {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: {},
      body: raw,
      raw,
    };
  }

  const fmRaw = match[1];
  const body = match[2] || '';
  const parsed = (yaml.load(fmRaw) as Record<string, unknown> | undefined) || {};

  return {
    frontmatter: parsed,
    body,
    raw,
  };
}

export function serializeMarkdown(frontmatter: Record<string, unknown>, body: string): string {
  const fm = yaml.dump(frontmatter, { lineWidth: -1, noRefs: true }).trimEnd();
  return `---\n${fm}\n---\n\n${body.trimStart()}`;
}

export function extractSections(markdownBody: string): string[] {
  const matches = markdownBody.match(/^##+\s+(.+)$/gm) || [];
  return matches.map((line) => line.replace(/^##+\s+/, '').trim());
}
