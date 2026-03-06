import { UniversalCommand } from '@supernal/universal-command';
import path from 'node:path';
import { installChecks } from './cli/git-hooks.js';
import { runCleanup } from './cli/cleanup.js';
import { installWatcher } from './cli/watcher.js';
import {
  explainPath,
  fixPath,
  generateComplianceReport,
  generateSchemaFromContent,
  getRepotypePresetMetadata,
  initRepotypeConfig,
  installPluginRequirements,
  pluginStatus,
  scaffoldFromTemplate,
  validatePath,
} from './cli/use-cases.js';
import { applyOperationsConfig, getOperationsStatus } from './cli/operations.js';

function parseSetFlags(values: string[] = []): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const entry of values) {
    const idx = entry.indexOf('=');
    if (idx <= 0) continue;
    const key = entry.slice(0, idx);
    const value = entry.slice(idx + 1);
    output[key] = value;
  }
  return output;
}

export const repotypeValidateCommand = new UniversalCommand<
  { target?: string; config?: string },
  { ok: boolean; filesScanned: number; diagnostics: unknown[] }
>({
  name: 'repotype validate',
  description: 'Validate repository structure and markdown/frontmatter rules against repotype.yaml',
  scope: 'project',
  keywords: ['repo', 'schema', 'lint', 'markdown', 'frontmatter', 'validation'],
  input: {
    parameters: [
      {
        name: 'target',
        type: 'string',
        description: 'Target file/directory to validate',
        positional: true,
        required: false,
      },
      {
        name: 'config',
        type: 'string',
        description: 'Explicit config path',
        positional: false,
        required: false,
      },
    ],
  },
  output: {
    type: 'json',
  },
  async handler({ target = '.', config }) {
    const result = await validatePath(target, config);
    return {
      ok: result.ok,
      filesScanned: result.filesScanned,
      diagnostics: result.diagnostics,
    };
  },
});

export const repotypeExplainCommand = new UniversalCommand<
  { file: string; config?: string },
  { reason: string[]; effective: unknown }
>({
  name: 'repotype explain',
  description: 'Explain which schema rules apply to a specific file',
  scope: 'project',
  keywords: ['repo', 'schema', 'explain', 'rules'],
  input: {
    parameters: [
      {
        name: 'file',
        type: 'string',
        description: 'File path to explain',
        positional: true,
        required: true,
      },
      {
        name: 'config',
        type: 'string',
        description: 'Explicit config path',
        positional: false,
        required: false,
      },
    ],
  },
  output: {
    type: 'json',
  },
  async handler({ file, config }) {
    const output = explainPath(file, config);
    return {
      reason: output.reason,
      effective: output.effective,
    };
  },
});

export const repotypeStatusCommand = new UniversalCommand<
  { target?: string },
  ReturnType<typeof getOperationsStatus>
>({
  name: 'repotype status',
  description: 'Show repotype-managed hooks, watcher state, and cleanup log status',
  scope: 'project',
  keywords: ['repotype', 'status', 'hooks', 'watcher', 'cleanup'],
  input: {
    parameters: [
      {
        name: 'target',
        type: 'string',
        description: 'Repository path',
        positional: true,
        required: false,
      },
    ],
  },
  output: {
    type: 'json',
  },
  async handler({ target = '.' }) {
    return getOperationsStatus(target);
  },
});

export const repotypeApplyCommand = new UniversalCommand<
  { target?: string },
  ReturnType<typeof applyOperationsConfig>
>({
  name: 'repotype apply',
  description: 'Apply operations config from repotype.yaml (hooks and watcher)',
  scope: 'project',
  keywords: ['repotype', 'apply', 'operations', 'hooks', 'watcher'],
  input: {
    parameters: [
      {
        name: 'target',
        type: 'string',
        description: 'Repository path',
        positional: true,
        required: false,
      },
    ],
  },
  output: {
    type: 'json',
  },
  async handler({ target = '.' }) {
    return applyOperationsConfig(target);
  },
});

export const repotypeReportCommand = new UniversalCommand<
  { target?: string; format?: 'markdown' | 'json' | 'html'; config?: string },
  Awaited<ReturnType<typeof generateComplianceReport>>
>({
  name: 'repotype report',
  description: 'Generate compliance evidence report for a target path',
  scope: 'project',
  keywords: ['repotype', 'report', 'evidence', 'compliance'],
  input: {
    parameters: [
      {
        name: 'target',
        type: 'string',
        description: 'Target file/directory to report on',
        positional: true,
        required: false,
      },
      {
        name: 'format',
        type: 'string',
        description: 'Report format (markdown|json|html)',
        positional: false,
        required: false,
      },
      {
        name: 'config',
        type: 'string',
        description: 'Explicit config path',
        positional: false,
        required: false,
      },
    ],
  },
  output: {
    type: 'json',
  },
  async handler({ target = '.', format = 'markdown', config }) {
    return generateComplianceReport(target, format, config);
  },
});

export const repotypeFixCommand = new UniversalCommand<
  { target?: string; config?: string },
  Awaited<ReturnType<typeof fixPath>>
>({
  name: 'repotype fix',
  description: 'Apply safe autofixes and return remaining diagnostics',
  scope: 'project',
  keywords: ['repotype', 'fix', 'autofix', 'validation'],
  input: {
    parameters: [
      {
        name: 'target',
        type: 'string',
        description: 'Target file or directory',
        positional: true,
        required: false,
      },
      {
        name: 'config',
        type: 'string',
        description: 'Explicit config path',
        positional: false,
        required: false,
      },
    ],
  },
  output: { type: 'json' },
  async handler({ target = '.', config }) {
    return fixPath(target, config);
  },
});

export const repotypeCleanupRunCommand = new UniversalCommand<
  { target?: string; queue?: string; minErrors?: number; dryRun?: boolean },
  Awaited<ReturnType<typeof runCleanup>>
>({
  name: 'repotype cleanup-run',
  description: 'Move severely invalid files into a triage queue',
  scope: 'project',
  keywords: ['repotype', 'cleanup', 'triage', 'sort_queue'],
  input: {
    parameters: [
      { name: 'target', type: 'string', description: 'Target path', positional: true, required: false },
      { name: 'queue', type: 'string', description: 'Queue directory', positional: false, required: false },
      { name: 'minErrors', type: 'number', description: 'Minimum error count before moving', positional: false, required: false },
      { name: 'dryRun', type: 'boolean', description: 'Dry run only', positional: false, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({ target = '.', queue = 'sort_queue', minErrors = 3, dryRun = false }) {
    const absoluteTarget = path.resolve(target);
    const queueDir = path.isAbsolute(queue) ? queue : path.resolve(absoluteTarget, queue);
    return runCleanup({ target: absoluteTarget, queueDir, minErrors, dryRun });
  },
});

export const repotypeInstallChecksCommand = new UniversalCommand<
  { target?: string; hook?: 'pre-commit' | 'pre-push' | 'both' },
  ReturnType<typeof installChecks>
>({
  name: 'repotype install-checks',
  description: 'Install repotype git hooks (pre-commit/pre-push)',
  scope: 'project',
  keywords: ['repotype', 'git', 'hooks', 'pre-commit', 'pre-push'],
  input: {
    parameters: [
      { name: 'target', type: 'string', description: 'Repository path', positional: false, required: false },
      { name: 'hook', type: 'string', description: 'Hook mode: pre-commit|pre-push|both', positional: false, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({ target = '.', hook = 'both' }) {
    return installChecks({ target, hook });
  },
});

export const repotypeInstallWatcherCommand = new UniversalCommand<
  { target?: string; schedule?: string; queue?: string; minErrors?: number; logFile?: string; dryRun?: boolean },
  ReturnType<typeof installWatcher>
>({
  name: 'repotype install-watcher',
  description: 'Install cron watcher for repotype cleanup automation',
  scope: 'project',
  keywords: ['repotype', 'watcher', 'cron', 'cleanup'],
  input: {
    parameters: [
      { name: 'target', type: 'string', description: 'Repository path', positional: false, required: false },
      { name: 'schedule', type: 'string', description: 'Cron schedule', positional: false, required: false },
      { name: 'queue', type: 'string', description: 'Queue directory', positional: false, required: false },
      { name: 'minErrors', type: 'number', description: 'Minimum errors threshold', positional: false, required: false },
      { name: 'logFile', type: 'string', description: 'Watcher log file path', positional: false, required: false },
      { name: 'dryRun', type: 'boolean', description: 'Dry-run installation', positional: false, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({
    target = '.',
    schedule = '*/15 * * * *',
    queue = 'sort_queue',
    minErrors = 3,
    logFile = '.repotype/logs/watcher.log',
    dryRun = true,
  }) {
    const resolvedTarget = path.resolve(target);
    const queueDir = path.isAbsolute(queue) ? queue : path.resolve(resolvedTarget, queue);
    const resolvedLogFile = path.isAbsolute(logFile) ? logFile : path.resolve(resolvedTarget, logFile);
    return installWatcher({
      target: resolvedTarget,
      schedule,
      queueDir,
      minErrors,
      logFile: resolvedLogFile,
      dryRun,
    });
  },
});

export const repotypeScaffoldCommand = new UniversalCommand<
  { templateId: string; output: string; set?: string[] },
  { created: string }
>({
  name: 'repotype scaffold',
  description: 'Create a file from a configured template',
  scope: 'project',
  keywords: ['repotype', 'scaffold', 'template', 'generate'],
  input: {
    parameters: [
      { name: 'templateId', type: 'string', description: 'Template id', positional: true, required: true },
      { name: 'output', type: 'string', description: 'Output path', positional: true, required: true },
      { name: 'set', type: 'string', description: 'Template variable key=value (repeatable)', positional: false, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({ templateId, output, set = [] }) {
    const created = scaffoldFromTemplate(templateId, output, parseSetFlags(Array.isArray(set) ? set : [set]));
    return { created };
  },
});

export const repotypeGenerateSchemaCommand = new UniversalCommand<
  { target: string; output: string; pattern?: string },
  ReturnType<typeof generateSchemaFromContent>
>({
  name: 'repotype generate schema',
  description: 'Generate frontmatter JSON schema from markdown content',
  scope: 'project',
  keywords: ['repotype', 'generate', 'schema', 'frontmatter'],
  input: {
    parameters: [
      { name: 'target', type: 'string', description: 'File or directory target', positional: true, required: true },
      { name: 'output', type: 'string', description: 'Output schema path', positional: true, required: true },
      { name: 'pattern', type: 'string', description: 'Glob pattern when target is directory', positional: false, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({ target, output, pattern = '**/*.md' }) {
    return generateSchemaFromContent(target, output, pattern);
  },
});

export const repotypeInitCommand = new UniversalCommand<
  { target?: string; type?: 'default'; from?: string; force?: boolean },
  ReturnType<typeof initRepotypeConfig>
>({
  name: 'repotype init',
  description: 'Initialize repotype.yaml from generic preset or external source',
  scope: 'project',
  keywords: ['repotype', 'init', 'profile', 'bootstrap'],
  input: {
    parameters: [
      { name: 'target', type: 'string', description: 'Target directory', positional: true, required: false },
      { name: 'type', type: 'string', description: 'Profile type (default)', positional: false, required: false },
      { name: 'from', type: 'string', description: 'External config path', positional: false, required: false },
      { name: 'force', type: 'boolean', description: 'Overwrite existing config', positional: false, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({ target = '.', type = 'default', from, force = false }) {
    const metadata = getRepotypePresetMetadata();
    if (!metadata.types.includes(type)) {
      throw new Error(`Unsupported preset type '${type}'.`);
    }
    return initRepotypeConfig(target, { type, from, force });
  },
});

export const repotypePluginsStatusCommand = new UniversalCommand<
  { target?: string },
  ReturnType<typeof pluginStatus>
>({
  name: 'repotype plugins status',
  description: 'Show configured plugin requirement status',
  scope: 'project',
  keywords: ['repotype', 'plugins', 'status'],
  input: {
    parameters: [
      { name: 'target', type: 'string', description: 'Repository path', positional: true, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({ target = '.' }) {
    return pluginStatus(target);
  },
});

export const repotypePluginsInstallCommand = new UniversalCommand<
  { target?: string },
  ReturnType<typeof installPluginRequirements>
>({
  name: 'repotype plugins install',
  description: 'Run configured plugin installation commands',
  scope: 'project',
  keywords: ['repotype', 'plugins', 'install'],
  input: {
    parameters: [
      { name: 'target', type: 'string', description: 'Repository path', positional: true, required: false },
    ],
  },
  output: { type: 'json' },
  async handler({ target = '.' }) {
    return installPluginRequirements(target);
  },
});
