import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  repotypeApplyCommand,
  repotypeCleanupRunCommand,
  repotypeExplainCommand,
  repotypeFixCommand,
  repotypeGenerateSchemaCommand,
  repotypeInitCommand,
  repotypeInstallChecksCommand,
  repotypeInstallWatcherCommand,
  repotypePluginsInstallCommand,
  repotypePluginsStatusCommand,
  repotypeReportCommand,
  repotypeScaffoldCommand,
  repotypeStatusCommand,
  repotypeValidateCommand,
} from '../src/universal-commands.js';

const REQUIRED_COMMANDS = [
  'repotype validate',
  'repotype report',
  'repotype fix',
  'repotype cleanup-run',
  'repotype install-checks',
  'repotype install-watcher',
  'repotype status',
  'repotype apply',
  'repotype explain',
  'repotype scaffold',
  'repotype generate schema',
  'repotype init',
  'repotype plugins status',
  'repotype plugins install',
];

describe('CLI / universal command parity', () => {
  it('exposes required command surface in universal-command exports', () => {
    const commands = [
      repotypeValidateCommand,
      repotypeReportCommand,
      repotypeFixCommand,
      repotypeCleanupRunCommand,
      repotypeInstallChecksCommand,
      repotypeInstallWatcherCommand,
      repotypeStatusCommand,
      repotypeApplyCommand,
      repotypeExplainCommand,
      repotypeScaffoldCommand,
      repotypeGenerateSchemaCommand,
      repotypeInitCommand,
      repotypePluginsStatusCommand,
      repotypePluginsInstallCommand,
    ];

    const exportedNames = new Set(commands.map((command) => command.schema.name));
    for (const name of REQUIRED_COMMANDS) {
      expect(exportedNames.has(name)).toBe(true);
    }
  });

  it('keeps CLI entrypoint registrations for required commands', () => {
    const thisDir = path.dirname(fileURLToPath(import.meta.url));
    const mainPath = path.resolve(thisDir, '../src/cli/main.ts');
    const source = fs.readFileSync(mainPath, 'utf8');
    const requiredCliFragments = [
      ".command('validate')",
      ".command('report')",
      ".command('fix')",
      ".command('cleanup-run')",
      ".command('install-checks')",
      ".command('install-watcher')",
      ".command('status')",
      ".command('apply')",
      ".command('explain')",
      ".command('scaffold')",
      ".command('generate')",
      ".command('schema')",
      ".command('init')",
      ".command('plugins')",
      ".command('install')",
    ];

    for (const fragment of requiredCliFragments) {
      expect(source.includes(fragment)).toBe(true);
    }
  });
});
