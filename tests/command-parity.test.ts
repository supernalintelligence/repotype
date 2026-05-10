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

const allCommands = [
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

describe('CLI / universal command parity', () => {
  it('exposes required command surface in universal-command exports', () => {
    const exportedNames = new Set(allCommands.map((command) => command.schema.name));
    for (const name of REQUIRED_COMMANDS) {
      expect(exportedNames.has(name)).toBe(true);
    }
  });

  it('all required commands can produce a CLI Commander instance via .toCLI()', () => {
    for (const cmd of allCommands) {
      const cli = cmd.toCLI();
      expect(cli).toBeTruthy();
      expect(typeof cli.name).toBe('function');
    }
  });

  it('all required commands can produce an MCP tool descriptor via .toMCP()', () => {
    for (const cmd of allCommands) {
      const mcp = cmd.toMCP();
      expect(mcp).toBeTruthy();
      expect(typeof mcp.name).toBe('string');
      expect(mcp.name.length).toBeGreaterThan(0);
    }
  });
});
