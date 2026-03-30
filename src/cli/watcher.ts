import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export interface InstallWatcherOptions {
  target: string;
  schedule: string;
  queueDir: string;
  minErrors: number;
  logFile: string;
  dryRun?: boolean;
}

function shQuote(input: string): string {
  return `'${input.replace(/'/g, `'"'"'`)}'`;
}

function readCrontab(): string {
  const read = spawnSync('crontab', ['-l'], { encoding: 'utf8' });
  if (read.status !== 0) {
    return '';
  }
  return read.stdout || '';
}

function writeCrontab(content: string): void {
  const write = spawnSync('crontab', ['-'], { input: content, encoding: 'utf8' });
  if (write.status !== 0) {
    throw new Error(write.stderr || 'Failed to write crontab');
  }
}

export function installWatcher(options: InstallWatcherOptions): {
  marker: string;
  schedule: string;
  command: string;
  line: string;
  changed: boolean;
} {
  const target = path.resolve(options.target);
  const queueDir = path.resolve(options.queueDir);
  const logFile = path.resolve(options.logFile);

  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.mkdirSync(queueDir, { recursive: true });

  const marker = `# REPOTYPE_WATCHER:${target}`;
  const command = [
    `cd ${shQuote(target)}`,
    `&& repotype cleanup-run ${shQuote(target)}`,
    `--queue ${shQuote(queueDir)}`,
    `--min-errors ${options.minErrors}`,
    `>> ${shQuote(logFile)} 2>&1`,
  ].join(' ');

  const line = `${options.schedule} ${command} ${marker}`;
  const current = readCrontab();
  const lines = current
    .split('\n')
    .map((entry) => entry.trimEnd())
    .filter((entry) => entry.length > 0);

  const filtered = lines.filter((entry) => !entry.includes(marker));
  const changed = filtered.length !== lines.length || !lines.includes(line);

  const nextLines = [...filtered, line];
  const next = `${nextLines.join('\n')}\n`;

  if (!options.dryRun && changed) {
    writeCrontab(next);
  }

  return {
    marker,
    schedule: options.schedule,
    command,
    line,
    changed,
  };
}

export function inspectWatcher(target: string): {
  marker: string;
  installed: boolean;
  line?: string;
} {
  const resolved = path.resolve(target);
  const marker = `# REPOTYPE_WATCHER:${resolved}`;
  const current = readCrontab();
  const lines = current
    .split('\n')
    .map((entry) => entry.trimEnd())
    .filter((entry) => entry.length > 0);

  const line = lines.find((entry) => entry.includes(marker));
  return {
    marker,
    installed: Boolean(line),
    line,
  };
}

export function uninstallWatcher(target: string, dryRun = false): {
  marker: string;
  removed: boolean;
  changed: boolean;
} {
  const resolved = path.resolve(target);
  const marker = `# REPOTYPE_WATCHER:${resolved}`;
  const current = readCrontab();
  const lines = current
    .split('\n')
    .map((entry) => entry.trimEnd())
    .filter((entry) => entry.length > 0);

  const filtered = lines.filter((entry) => !entry.includes(marker));
  const changed = filtered.length !== lines.length;

  if (changed && !dryRun) {
    const next = filtered.length > 0 ? `${filtered.join('\n')}\n` : '';
    writeCrontab(next);
  }

  return {
    marker,
    removed: changed,
    changed,
  };
}
