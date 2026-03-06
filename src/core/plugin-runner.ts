import path from 'node:path';
import { execSync } from 'node:child_process';
import type { Diagnostic, PluginCommand, PluginRequirement, RepoSchemaConfig } from './types.js';

interface PluginExecResult {
  ok: boolean;
  output: string;
  code: number;
}

function runCommand(command: PluginCommand, repoRoot: string): PluginExecResult {
  const cwd = command.cwd ? path.resolve(repoRoot, command.cwd) : repoRoot;

  try {
    const output = execSync(command.cmd, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      shell: process.env.SHELL || '/bin/sh',
      env: process.env,
    });
    return { ok: true, output: output?.trim?.() || '', code: 0 };
  } catch (error: any) {
    const stdout = typeof error?.stdout === 'string' ? error.stdout : '';
    const stderr = typeof error?.stderr === 'string' ? error.stderr : '';
    const output = `${stdout}\n${stderr}`.trim();
    return {
      ok: false,
      output,
      code: typeof error?.status === 'number' ? error.status : 1,
    };
  }
}

function isEnabled(plugin: PluginRequirement): boolean {
  return plugin.enabled !== false;
}

function asFailureSeverity(plugin: PluginRequirement): 'error' | 'warning' | 'suggestion' {
  const severity = plugin.severityOnFailure || 'error';
  if (severity === 'warning' || severity === 'suggestion') {
    return severity;
  }
  return 'error';
}

export function runPluginPhase(
  config: RepoSchemaConfig,
  repoRoot: string,
  phase: 'validate' | 'fix',
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const plugins = config.plugins || [];

  for (const plugin of plugins) {
    if (!isEnabled(plugin)) {
      continue;
    }

    const command = phase === 'validate' ? plugin.validate : plugin.fix;
    if (!command) {
      continue;
    }

    const result = runCommand(command, repoRoot);
    if (result.ok) {
      diagnostics.push({
        code: `plugin_${phase}_ok`,
        message: `Plugin '${plugin.id}' ${phase} command succeeded`,
        severity: 'suggestion',
        file: repoRoot,
        ruleId: plugin.id,
        details: {
          command: command.cmd,
          output: result.output || undefined,
        },
      });
      continue;
    }

    diagnostics.push({
      code: `plugin_${phase}_failed`,
      message: `Plugin '${plugin.id}' ${phase} command failed (exit ${result.code})`,
      severity: asFailureSeverity(plugin),
      file: repoRoot,
      ruleId: plugin.id,
      details: {
        command: command.cmd,
        output: result.output || undefined,
      },
    });
  }

  return diagnostics;
}

export function installPlugins(
  config: RepoSchemaConfig,
  repoRoot: string,
): Array<{ id: string; ok: boolean; command: string; code: number; output?: string }> {
  const results: Array<{ id: string; ok: boolean; command: string; code: number; output?: string }> = [];
  const plugins = config.plugins || [];

  for (const plugin of plugins) {
    if (!isEnabled(plugin)) {
      continue;
    }
    for (const command of plugin.install || []) {
      const result = runCommand(command, repoRoot);
      results.push({
        id: plugin.id,
        ok: result.ok,
        command: command.cmd,
        code: result.code,
        output: result.output || undefined,
      });
    }
  }

  return results;
}

export function describePlugins(config: RepoSchemaConfig): Array<{
  id: string;
  enabled: boolean;
  hasInstall: boolean;
  hasValidate: boolean;
  hasFix: boolean;
}> {
  return (config.plugins || []).map((plugin) => ({
    id: plugin.id,
    enabled: isEnabled(plugin),
    hasInstall: Boolean(plugin.install && plugin.install.length > 0),
    hasValidate: Boolean(plugin.validate),
    hasFix: Boolean(plugin.fix),
  }));
}
