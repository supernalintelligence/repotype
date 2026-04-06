import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { startService } from '../service/server.js';
import { installChecks } from './git-hooks.js';
import { runCleanup } from './cleanup.js';
import { installWatcher } from './watcher.js';
import { applyOperationsConfig, getOperationsStatus } from './operations.js';
import { findConfig } from '../core/config-loader.js';
import { discoverWorkspaces, loadWorkspaceCache, hashConfigFiles } from '../core/config-loader.js';
import { createIgnoreMatcher } from '../core/path-ignore.js';
import {
  generateSchemaFromContent,
  generateComplianceReport,
  getRepotypePresetMetadata,
  initRepotypeConfig,
  installPluginRequirements,
  pluginStatus,
  scaffoldFromTemplate,
  validatePath,
  explainPath,
  fixPath,
} from './use-cases.js';

const ISSUE_URL = 'https://github.com/supernalintelligence/supernal-coding/issues';
const STAR_URL = 'https://github.com/supernalintelligence/supernal-coding';

interface SeverityCounts {
  errors: number;
  warnings: number;
  suggestions: number;
}

function countDiagnostics(
  diagnostics: Array<{ severity: 'error' | 'warning' | 'suggestion' }>,
): SeverityCounts {
  return diagnostics.reduce(
    (acc, d) => {
      if (d.severity === 'error') acc.errors += 1;
      if (d.severity === 'warning') acc.warnings += 1;
      if (d.severity === 'suggestion') acc.suggestions += 1;
      return acc;
    },
    { errors: 0, warnings: 0, suggestions: 0 },
  );
}

function maybeEmitCommunityPrompt(): void {
  if (Math.random() < 0.2) {
    console.error(
      `[repotype] If this helps, please star: ${STAR_URL} | File issues on: ${ISSUE_URL}`,
    );
  }
}

function emitBoundaryGuidance(context: string, counts: SeverityCounts): void {
  if (counts.errors > 0) {
    console.error(
      `[repotype] ${context}: found ${counts.errors} error(s). If this looks wrong or important, file an issue: ${ISSUE_URL}`,
    );
  } else if (counts.warnings > 0) {
    console.error(
      `[repotype] ${context}: found ${counts.warnings} warning(s). If behavior is unexpected, file an issue: ${ISSUE_URL}`,
    );
  }
  maybeEmitCommunityPrompt();
}

function parseSetFlags(values: string[]): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const entry of values) {
    const idx = entry.indexOf('=');
    if (idx <= 0) {
      continue;
    }
    const key = entry.slice(0, idx);
    const value = entry.slice(idx + 1);
    output[key] = value;
  }
  return output;
}

export async function runCLI(argv: string[]): Promise<number> {
  const program = new Command();

  program
    .name('repotype')
    .description('Repository schema validation, scaffolding, fix, and service runtime')
    .version('0.1.0');

  program.hook('postAction', () => {
    maybeEmitCommunityPrompt();
  });

  program
    .command('validate')
    .argument('[target]', 'file or directory to validate', '.')
    .option('--json', 'emit machine-readable JSON', false)
    .option('--config <path>', 'explicit config file path (repotype.yaml)', '')
    .option('--workspace', 'enable workspace mode (auto-detected by default)', true)
    .option('--no-workspace', 'disable workspace mode, validate as flat single config')
    .option('--no-cache', 'skip workspace cache read/write', false)
    .action(async (target: string, options: { json: boolean; config: string; workspace: boolean; noCache: boolean }) => {
      const validateResult = await validatePath(target, options.config || undefined, {
        workspace: options.workspace,
        noCache: options.noCache,
      });

      if (options.json) {
        console.log(JSON.stringify(validateResult, null, 2));
        process.exitCode = validateResult.result.ok ? 0 : 1;
        return;
      }

      if (validateResult.mode === 'workspace') {
        const wsResult = validateResult.result;
        console.log(`mode: workspace (${wsResult.workspaces.length} child workspace(s))`);
        console.log(`files scanned: ${wsResult.filesScanned}`);

        // Root section
        const rootCounts = countDiagnostics(wsResult.rootResult.diagnostics);
        console.log(`\n[root]`);
        console.log(`  files: ${wsResult.rootResult.filesScanned}`);
        console.log(`  errors: ${rootCounts.errors}, warnings: ${rootCounts.warnings}, suggestions: ${rootCounts.suggestions}`);
        for (const d of wsResult.rootResult.diagnostics) {
          console.log(`  [${d.severity}] ${d.code}: ${d.message} (${d.file})`);
        }

        // Per-workspace sections
        for (const ws of wsResult.workspaces) {
          const wsCounts = countDiagnostics(ws.result.diagnostics);
          console.log(`\n[${ws.subtreeRoot}]`);
          console.log(`  config: ${ws.configPath}`);
          console.log(`  files: ${ws.result.filesScanned}`);
          console.log(`  errors: ${wsCounts.errors}, warnings: ${wsCounts.warnings}, suggestions: ${wsCounts.suggestions}`);
          for (const d of ws.result.diagnostics) {
            console.log(`  [${d.severity}] ${d.code}: ${d.message} (${d.file})`);
          }
        }

        // Conflicts
        if (wsResult.conflicts.length > 0) {
          console.log(`\n[conflicts]`);
          for (const c of wsResult.conflicts) {
            console.log(`  [${c.severity}] ${c.code}: ${c.message}`);
          }
        }

        const allDiagnostics = [
          ...wsResult.rootResult.diagnostics,
          ...wsResult.workspaces.flatMap((ws) => ws.result.diagnostics),
        ];
        const totalCounts = countDiagnostics(allDiagnostics);
        emitBoundaryGuidance('validate', totalCounts);
        process.exitCode = wsResult.ok ? 0 : 1;
      } else {
        const result = validateResult.result;
        const counts = countDiagnostics(result.diagnostics);
        console.log(`files scanned: ${result.filesScanned}`);
        console.log(`diagnostics: ${result.diagnostics.length}`);
        console.log(`errors: ${counts.errors}, warnings: ${counts.warnings}, suggestions: ${counts.suggestions}`);
        for (const d of result.diagnostics) {
          console.log(`[${d.severity}] ${d.code}: ${d.message} (${d.file})`);
        }
        emitBoundaryGuidance('validate', counts);
        process.exitCode = result.ok ? 0 : 1;
      }
    });

  program
    .command('report')
    .argument('[target]', 'file or directory to report on', '.')
    .option('--json', 'emit machine-readable JSON report', false)
    .option('--format <format>', 'report format: markdown | json | html', 'markdown')
    .option('--config <path>', 'explicit config file path (repotype.yaml)', '')
    .option('--output <file>', 'write report to file')
    .action(async (target: string, options: { json: boolean; format: string; config: string; output?: string }) => {
      const format = options.json ? 'json' : options.format;
      if (!['markdown', 'json', 'html'].includes(format)) {
        throw new Error(`Unsupported report format '${format}'. Use markdown, json, or html.`);
      }

      const output = await generateComplianceReport(
        target,
        format as 'markdown' | 'json' | 'html',
        options.config || undefined,
      );
      if (options.output) {
        const outPath = path.resolve(options.output);
        const parent = path.dirname(outPath);
        if (!fs.existsSync(parent)) {
          fs.mkdirSync(parent, { recursive: true });
        }
        fs.writeFileSync(outPath, output.rendered);
        console.log(`report written: ${outPath}`);
      } else {
        console.log(output.rendered);
      }
      emitBoundaryGuidance('report', output.report.totals);
      process.exitCode = output.ok ? 0 : 1;
    });

  program
    .command('fix')
    .argument('[target]', 'file or directory to validate/fix', '.')
    .option('--config <path>', 'explicit config file path (repotype.yaml)', '')
    .option('--workspace', 'enable workspace mode (auto-detected by default)', true)
    .option('--no-workspace', 'disable workspace mode, fix as flat single config')
    .option('--no-cache', 'skip workspace cache read/write', false)
    .action(async (target: string, options: { config: string; workspace: boolean; noCache: boolean }) => {
      const output = await fixPath(target, options.config || undefined, {
        workspace: options.workspace,
        noCache: options.noCache,
      });
      console.log(`applied fixes: ${output.fix.applied}`);
      const allDiagnostics =
        output.validation.mode === 'workspace'
          ? [
              ...output.validation.result.rootResult.diagnostics,
              ...output.validation.result.workspaces.flatMap((ws) => ws.result.diagnostics),
            ]
          : output.validation.result.diagnostics;
      const counts = countDiagnostics(allDiagnostics);
      console.log(`remaining diagnostics: ${allDiagnostics.length}`);
      emitBoundaryGuidance('fix', counts);
      process.exitCode = output.validation.result.ok ? 0 : 1;
    });

  program
    .command('cleanup-run')
    .argument('[target]', 'file or directory to validate/cleanup', '.')
    .option('--queue <dir>', 'sort queue directory', 'sort_queue')
    .option('--min-errors <n>', 'minimum error count before moving file', '3')
    .option('--dry-run', 'show what would be moved without moving files', false)
    .option('--json', 'emit machine-readable JSON', false)
    .action(async (target: string, options: { queue: string; minErrors: string; dryRun: boolean; json: boolean }) => {
      const absoluteTarget = path.resolve(target);
      const queueDir = path.isAbsolute(options.queue)
        ? options.queue
        : path.resolve(absoluteTarget, options.queue);

      const result = await runCleanup({
        target: absoluteTarget,
        queueDir,
        minErrors: Number.parseInt(options.minErrors, 10),
        dryRun: options.dryRun,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`scanned: ${result.scanned}`);
        console.log(`cleanup candidates: ${result.candidates}`);
        console.log(`moved: ${result.moved}`);
      }
    });

  program
    .command('install-checks')
    .option('--hook <hook>', 'pre-commit | pre-push | both', 'both')
    .option('--target <dir>', 'repository path', '.')
    .action((options: { hook: 'pre-commit' | 'pre-push' | 'both'; target: string }) => {
      const output = installChecks({
        hook: options.hook,
        target: options.target,
      });

      console.log(`git root: ${output.repoRoot}`);
      for (const hook of output.hooks) {
        console.log(`${hook.hook}: ${hook.status} (${hook.path})`);
      }
    });

  program
    .command('install-watcher')
    .option('--target <dir>', 'repository path', '.')
    .option('--schedule <cron>', 'cron schedule expression', '*/15 * * * *')
    .option('--queue <dir>', 'sort queue directory', 'sort_queue')
    .option('--min-errors <n>', 'minimum errors before moving file', '3')
    .option('--log-file <file>', 'watcher stdout/stderr log file', '.repotype/logs/watcher.log')
    .option('--dry-run', 'print cron line without writing crontab', false)
    .action((options: {
      target: string;
      schedule: string;
      queue: string;
      minErrors: string;
      logFile: string;
      dryRun: boolean;
    }) => {
      const target = path.resolve(options.target);
      const queueDir = path.isAbsolute(options.queue) ? options.queue : path.resolve(target, options.queue);
      const logFile = path.isAbsolute(options.logFile) ? options.logFile : path.resolve(target, options.logFile);

      const output = installWatcher({
        target,
        schedule: options.schedule,
        queueDir,
        minErrors: Number.parseInt(options.minErrors, 10),
        logFile,
        dryRun: options.dryRun,
      });

      console.log(`watcher marker: ${output.marker}`);
      console.log(`schedule: ${output.schedule}`);
      console.log(`command: ${output.command}`);
      console.log(`changed: ${output.changed ? 'yes' : 'no'}`);
      if (options.dryRun) {
        console.log('dry-run: crontab not modified');
      }
    });

  program
    .command('status')
    .argument('[target]', 'repository path', '.')
    .option('--json', 'emit machine-readable JSON', false)
    .action((target: string, options: { json: boolean }) => {
      const status = getOperationsStatus(target);

      // Workspace status
      const repoRoot = status.repoRoot;
      const sharedIgnoreMatcher = createIgnoreMatcher(repoRoot);
      const workspaces = discoverWorkspaces(repoRoot, sharedIgnoreMatcher);
      const allConfigPaths = [status.configPath, ...workspaces.map((ws) => ws.configPath)];
      const currentHash = workspaces.length > 0 ? hashConfigFiles(allConfigPaths) : null;
      const cached = workspaces.length > 0 ? loadWorkspaceCache(repoRoot) : null;
      const cacheStatus = currentHash === null
        ? 'n/a'
        : cached && cached.hash === currentHash
          ? 'fresh'
          : 'stale or missing';

      const workspaceStatus = {
        mode: workspaces.length > 0 ? 'workspace' : 'flat',
        childCount: workspaces.length,
        subtreeRoots: workspaces.map((ws) => ws.subtreeRoot),
        cacheStatus,
      };

      if (options.json) {
        console.log(JSON.stringify({ ...status, workspace: workspaceStatus }, null, 2));
        return;
      }

      console.log(`repo root: ${status.repoRoot}`);
      console.log(`config: ${status.configPath}`);
      console.log('hooks:');
      for (const hook of status.hooks.hooks) {
        console.log(`  - ${hook.hook}: ${hook.managed ? 'managed' : (hook.exists ? 'exists (not managed)' : 'missing')}`);
      }
      console.log(`watcher: ${status.watcher.installed ? 'installed' : 'not installed'}`);
      if (status.watcher.line) {
        console.log(`watcher line: ${status.watcher.line}`);
      }
      console.log(`cleanup queue: ${status.cleanup.queueDir}`);
      console.log(`last cleanup: ${status.cleanup.lastRun.found ? 'found' : 'none'}`);

      // Workspace section
      console.log(`\nworkspace mode: ${workspaceStatus.mode}`);
      if (workspaces.length > 0) {
        console.log(`child configs: ${workspaces.length}`);
        console.log(`cache status: ${cacheStatus}`);
        for (const ws of workspaces) {
          console.log(`  - ${ws.subtreeRoot} (${ws.configPath})`);
        }
      }
    });

  program
    .command('apply')
    .argument('[target]', 'repository path', '.')
    .option('--json', 'emit machine-readable JSON', false)
    .action((target: string, options: { json: boolean }) => {
      const output = applyOperationsConfig(target);
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
        return;
      }
      console.log(`applied operations from ${output.configPath}`);
      console.log(`repo root: ${output.repoRoot}`);
      console.log('hooks operation completed');
      console.log('watcher operation completed');
    });

  program
    .command('explain')
    .argument('<file>', 'file path')
    .option('--json', 'emit machine-readable JSON', false)
    .option('--config <path>', 'explicit config file path (repotype.yaml)', '')
    .action((file: string, options: { json: boolean; config: string }) => {
      const output = explainPath(file, options.config || undefined);
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        for (const line of output.reason) {
          console.log(`- ${line}`);
        }
      }
    });

  program
    .command('scaffold')
    .argument('<templateId>', 'template id from repotype.yaml')
    .argument('<output>', 'output file path')
    .option('--set <kv>', 'template variable key=value', (value, prev: string[]) => {
      prev.push(value);
      return prev;
    }, [])
    .action((templateId: string, output: string, options: { set: string[] }) => {
      const variables = parseSetFlags(options.set);
      const created = scaffoldFromTemplate(templateId, output, variables);
      console.log(`created ${created}`);
    });

  program
    .command('init')
    .description('Initialize repotype.yaml from generic preset or external source')
    .argument('[target]', 'target directory for repotype.yaml', '.')
    .option('--type <type>', 'preset type: default|strict', 'default')
    .option('--from <path>', 'external YAML config to copy as repotype.yaml')
    .option('--force', 'overwrite existing repotype.yaml if present', false)
    .action((target: string, options: { type: string; from?: string; force: boolean }) => {
      const metadata = getRepotypePresetMetadata();
      if (!metadata.types.includes(options.type as (typeof metadata.types)[number])) {
        throw new Error(`Unsupported --type '${options.type}'. Use one of: ${metadata.types.join(', ')}`);
      }
      const created = initRepotypeConfig(target, {
        type: options.type as (typeof metadata.types)[number],
        from: options.from,
        force: options.force,
      });
      console.log(`initialized ${created.outputPath}`);
      console.log(`source: ${created.source}`);
    });

  program
    .command('generate')
    .description('Generate helper artifacts from repository content')
    .command('schema')
    .argument('<target>', 'file or directory to infer frontmatter schema from')
    .argument('<output>', 'output JSON schema path')
    .option('--pattern <glob>', 'glob pattern when target is a directory', '**/*.md')
    .action((target: string, output: string, options: { pattern: string }) => {
      const summary = generateSchemaFromContent(target, output, options.pattern);
      console.log(`schema written: ${summary.output}`);
      console.log(`files considered: ${summary.filesConsidered}`);
      console.log(`files parsed: ${summary.filesParsed}`);
      console.log(`files failed: ${summary.filesFailed}`);
      console.log(`properties: ${summary.properties.length}`);
      console.log(`required: ${summary.required.length}`);
    });

  const pluginsCommand = program
    .command('plugins')
    .description('Manage configured plugin requirements');

  pluginsCommand
    .command('status')
    .argument('[target]', 'repository path', '.')
    .option('--json', 'emit machine-readable JSON', false)
    .action((target: string, options: { json: boolean }) => {
      const status = pluginStatus(target);
      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
        return;
      }
      console.log(`repo root: ${status.repoRoot}`);
      console.log(`config: ${status.configPath}`);
      if (status.plugins.length === 0) {
        console.log('plugins: none configured');
        return;
      }
      for (const plugin of status.plugins) {
        console.log(
          `- ${plugin.id}: ${plugin.enabled ? 'enabled' : 'disabled'} ` +
            `(install=${plugin.hasInstall}, validate=${plugin.hasValidate}, fix=${plugin.hasFix})`
        );
      }
    });

  pluginsCommand
    .command('install')
    .argument('[target]', 'repository path', '.')
    .option('--json', 'emit machine-readable JSON', false)
    .action((target: string, options: { json: boolean }) => {
      const output = installPluginRequirements(target);
      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
        process.exitCode = output.ok ? 0 : 1;
        return;
      }
      console.log(`repo root: ${output.repoRoot}`);
      console.log(`config: ${output.configPath}`);
      if (output.installs.length === 0) {
        console.log('no plugin install commands configured');
      }
      for (const entry of output.installs) {
        console.log(
          `- ${entry.id}: ${entry.ok ? 'ok' : 'failed'} (exit=${entry.code}) command=${entry.command}`
        );
      }
      if (!output.ok) {
        console.error(
          `[repotype] plugins install: one or more plugin install commands failed. Please file an issue if this is unexpected: ${ISSUE_URL}`,
        );
      }
      process.exitCode = output.ok ? 0 : 1;
    });

  program
    .command('serve')
    .option('--port <port>', 'service port', '4310')
    .option('--cwd <cwd>', 'service working directory', process.cwd())
    .action(async (options: { port: string; cwd: string }) => {
      const port = Number.parseInt(options.port, 10);
      await startService({ port, cwd: options.cwd });
      console.log(`repotype service listening on ${port}`);
    });

  try {
    await program.parseAsync(argv);
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : String(error);
    console.error(`[repotype] unexpected failure: ${message}`);
    console.error(`[repotype] Please file an issue with command/context: ${ISSUE_URL}`);
    maybeEmitCommunityPrompt();
    process.exitCode = 1;
  }
  const exitCode = process.exitCode;
  return typeof exitCode === 'number' ? exitCode : 0;
}
