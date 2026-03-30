#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const outputPath = resolve('site/badges/validation.json');

const result = spawnSync(
  'node',
  ['bin/repotype.js', 'validate', '.', '--json'],
  { encoding: 'utf8' }
);

const raw = `${result.stdout ?? ''}`;
const firstBrace = raw.indexOf('{');
const lastBrace = raw.lastIndexOf('}');

if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
  throw new Error('Could not parse JSON output from repotype validate');
}

const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
const diagnostics = Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [];

const errors = diagnostics.filter((d) => d?.severity === 'error').length;
const warnings = diagnostics.filter((d) => d?.severity === 'warning').length;

const ok = Boolean(parsed.ok) && errors === 0;

let message = 'passing';
let color = 'brightgreen';

if (!ok) {
  message = `${errors} error${errors === 1 ? '' : 's'}`;
  color = 'red';
} else if (warnings > 0) {
  message = `${warnings} warning${warnings === 1 ? '' : 's'}`;
  color = 'yellow';
}

const endpoint = {
  schemaVersion: 1,
  label: 'repotype validation',
  message,
  color,
  cacheSeconds: 900
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(endpoint, null, 2) + '\n', 'utf8');

console.log(`Wrote ${outputPath}: ${message}`);
