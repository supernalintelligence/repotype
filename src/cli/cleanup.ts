import fs from 'node:fs';
import path from 'node:path';
import type { Diagnostic } from '../core/types.js';
import { validatePath } from './use-cases.js';

export interface CleanupRunOptions {
  target: string;
  queueDir: string;
  minErrors: number;
  dryRun?: boolean;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function dedupe<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function safeDestination(baseQueue: string, targetRoot: string, sourceFile: string): string {
  const relative = path.relative(targetRoot, sourceFile);
  const clamped = relative.startsWith('..') ? path.basename(sourceFile) : relative;
  const destination = path.join(baseQueue, clamped);

  if (!fs.existsSync(destination)) {
    return destination;
  }

  const ext = path.extname(destination);
  const stem = destination.slice(0, destination.length - ext.length);
  return `${stem}.moved-${Date.now()}${ext}`;
}

function writeAuditLogs(
  queueDir: string,
  entries: Array<{
    timestamp: string;
    source: string;
    destination: string;
    errorCount: number;
    diagnostics: Array<{ code: string; message: string }>;
    moved: boolean;
  }>,
): void {
  ensureDir(queueDir);

  const jsonlPath = path.join(queueDir, 'cleanup-log.jsonl');
  const textPath = path.join(queueDir, 'cleanup-log.md');

  for (const entry of entries) {
    fs.appendFileSync(jsonlPath, `${JSON.stringify(entry)}\n`);

    const summary = [
      `- ${entry.timestamp}`,
      `  - source: ${entry.source}`,
      `  - destination: ${entry.destination}`,
      `  - moved: ${entry.moved ? 'yes' : 'no (dry-run)'}`,
      `  - errors: ${entry.errorCount}`,
      ...entry.diagnostics.map((d) => `  - ${d.code}: ${d.message}`),
      '',
    ].join('\n');

    fs.appendFileSync(textPath, summary);
  }
}

export async function runCleanup(options: CleanupRunOptions): Promise<{
  scanned: number;
  candidates: number;
  moved: number;
  entries: Array<{
    source: string;
    destination: string;
    errorCount: number;
    moved: boolean;
  }>;
}> {
  const targetRoot = path.resolve(options.target);
  const queueDir = path.resolve(options.queueDir);
  ensureDir(queueDir);

  const validation = await validatePath(targetRoot);
  const errorDiagnostics = validation.diagnostics.filter((d) => d.severity === 'error');

  const files = dedupe(errorDiagnostics.map((d) => d.file));

  const entries: Array<{
    timestamp: string;
    source: string;
    destination: string;
    errorCount: number;
    diagnostics: Array<{ code: string; message: string }>;
    moved: boolean;
  }> = [];

  let moved = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      continue;
    }

    const diagnostics = errorDiagnostics.filter((d) => d.file === file);
    if (diagnostics.length < options.minErrors) {
      continue;
    }

    const destination = safeDestination(queueDir, targetRoot, file);
    ensureDir(path.dirname(destination));

    if (!options.dryRun) {
      fs.renameSync(file, destination);
      moved += 1;
    }

    entries.push({
      timestamp: getTimestamp(),
      source: file,
      destination,
      errorCount: diagnostics.length,
      diagnostics: diagnostics.map((d: Diagnostic) => ({ code: d.code, message: d.message })),
      moved: !options.dryRun,
    });
  }

  if (entries.length > 0) {
    writeAuditLogs(queueDir, entries);
  }

  return {
    scanned: validation.filesScanned,
    candidates: entries.length,
    moved,
    entries: entries.map((entry) => ({
      source: entry.source,
      destination: entry.destination,
      errorCount: entry.errorCount,
      moved: entry.moved,
    })),
  };
}
