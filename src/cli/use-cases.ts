import fs from 'node:fs';
import path from 'node:path';
import { applyAutofixes } from '../core/autofix.js';
import { findConfig, loadConfig } from '../core/config-loader.js';
import { describePlugins, installPlugins, runPluginPhase } from '../core/plugin-runner.js';
import { generateFrontmatterSchemaFromContent } from '../core/schema-generator.js';
import { explainRules } from '../core/rule-engine.js';
import { renderTemplate } from '../core/template-engine.js';
import type { AutofixAction, ValidateResult } from '../core/types.js';
import { createDefaultEngine } from './runtime.js';
import type { DiagnosticSeverity } from '../core/types.js';
import {
  createPresetConfig,
  listPresetTypes,
  type RepotypePresetType,
} from '../core/presets.js';
import type {
  ComplianceReportFormat,
  ComplianceReport,
  ReportCodeSummary,
  ReportFinding,
} from '../sdk/report-sdk.js';
import { renderComplianceReport } from '../sdk/report-sdk.js';
import yaml from 'js-yaml';

function deriveTargetRoot(targetPath: string): string {
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    return targetPath;
  }
  return path.dirname(targetPath);
}

export async function validatePath(
  target: string,
  configOverridePath?: string,
  opts: { workspace?: boolean; noCache?: boolean } = {},
): Promise<ValidateResult> {
  const absolute = path.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path.dirname(configPath);
  const config = loadConfig(configPath);
  const engine = createDefaultEngine();

  // If target is a directory and workspace mode is not explicitly disabled,
  // try workspace mode (auto-detects child configs).
  const isDirectory = fs.existsSync(absolute) && fs.statSync(absolute).isDirectory();
  const workspaceEnabled = opts.workspace !== false;

  if (isDirectory && workspaceEnabled && !configOverridePath) {
    const wsResult = await engine.validateWorkspace(absolute, { noCache: opts.noCache });
    if (wsResult.mode === 'workspace') {
      // Add plugin diagnostics to root result
      const pluginDiagnostics = runPluginPhase(config, repoRoot, 'validate');
      if (pluginDiagnostics.length > 0) {
        wsResult.result.rootResult.diagnostics.push(...pluginDiagnostics);
        wsResult.result.rootResult.ok = wsResult.result.rootResult.diagnostics.every(
          (d) => d.severity !== 'error',
        );
        wsResult.result.ok = wsResult.result.ok && wsResult.result.rootResult.ok;
      }
      return wsResult;
    }
    // flat mode returned from validateWorkspace — fall through with plugin diagnostics
    const pluginDiagnostics = runPluginPhase(config, repoRoot, 'validate');
    const diagnostics = [...wsResult.result.diagnostics, ...pluginDiagnostics];
    return {
      mode: 'flat',
      result: {
        ...wsResult.result,
        diagnostics,
        ok: diagnostics.every((d) => d.severity !== 'error'),
      },
    };
  }

  // Flat validation
  const result = await engine.validate(target, { configPath });
  const pluginDiagnostics = runPluginPhase(config, repoRoot, 'validate');
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];

  return {
    mode: 'flat',
    result: {
      ...result,
      diagnostics,
      ok: diagnostics.every((d) => d.severity !== 'error'),
    },
  };
}

export function explainPath(target: string, configOverridePath?: string) {
  const absolute = path.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path.dirname(configPath);
  const config = loadConfig(configPath);
  return explainRules(config, repoRoot, absolute);
}

export async function fixPath(
  target: string,
  configOverridePath?: string,
  opts: { workspace?: boolean; noCache?: boolean } = {},
) {
  const absolute = path.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path.dirname(configPath);
  const config = loadConfig(configPath);

  const validateResult = await validatePath(target, configOverridePath, opts);

  if (validateResult.mode === 'workspace') {
    // Apply fixes per workspace: root first, then children deepest-first
    const wsResult = validateResult.result;

    // Root fixes
    const rootActions: AutofixAction[] = wsResult.rootResult.diagnostics
      .map((d) => d.autofix)
      .filter((action): action is AutofixAction => Boolean(action));
    const rootFix = applyAutofixes(rootActions);

    // Child fixes (already sorted deepest-first)
    const childFixes = wsResult.workspaces.map((ws) => {
      const actions: AutofixAction[] = ws.result.diagnostics
        .map((d) => d.autofix)
        .filter((action): action is AutofixAction => Boolean(action));
      const fix = applyAutofixes(actions);
      return { configPath: ws.configPath, subtreeRoot: ws.subtreeRoot, fix };
    });

    const pluginDiagnostics = runPluginPhase(config, repoRoot, 'fix');
    wsResult.rootResult.diagnostics.push(...pluginDiagnostics);
    wsResult.rootResult.ok = wsResult.rootResult.diagnostics.every((d) => d.severity !== 'error');
    wsResult.ok = wsResult.ok && wsResult.rootResult.ok;

    const totalApplied =
      rootFix.applied + childFixes.reduce((acc, cf) => acc + cf.fix.applied, 0);

    return {
      validation: validateResult,
      fix: { applied: totalApplied },
      workspaceFixes: { root: rootFix, children: childFixes },
    };
  }

  // Flat mode
  const result = validateResult.result;
  const actions: AutofixAction[] = result.diagnostics
    .map((d) => d.autofix)
    .filter((action): action is AutofixAction => Boolean(action));

  const fixResult = applyAutofixes(actions);
  const pluginDiagnostics = runPluginPhase(config, repoRoot, 'fix');
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];
  const validation = {
    mode: 'flat' as const,
    result: {
      ...result,
      diagnostics,
      ok: diagnostics.every((d) => d.severity !== 'error'),
    },
  };

  return {
    validation,
    fix: fixResult,
  };
}

export function scaffoldFromTemplate(
  templateId: string,
  outputPath: string,
  variables: Record<string, unknown>,
): string {
  const absolute = path.resolve(outputPath);
  const configPath = findConfig(absolute);
  const repoRoot = path.dirname(configPath);
  const config = loadConfig(configPath);

  const content = renderTemplate(config, repoRoot, templateId, variables);
  const parent = path.dirname(absolute);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
  fs.writeFileSync(absolute, content);
  return absolute;
}

export function generateSchemaFromContent(
  target: string,
  output: string,
  pattern: string = '**/*.md',
) {
  return generateFrontmatterSchemaFromContent(target, output, pattern);
}

export function initRepotypeConfig(
  targetDir: string,
  options: {
    type?: RepotypePresetType;
    from?: string;
    force?: boolean;
  } = {},
) {
  const type = options.type ?? 'default';
  const force = options.force ?? false;
  const absoluteTarget = path.resolve(targetDir);
  const outputPath = path.join(absoluteTarget, 'repotype.yaml');
  if (fs.existsSync(outputPath) && !force) {
    throw new Error(`repotype.yaml already exists at ${outputPath}. Use --force to overwrite.`);
  }

  const config = options.from
    ? (yaml.load(fs.readFileSync(path.resolve(options.from), 'utf8')) as { version?: string })
    : createPresetConfig(type);
  if (!config || typeof config !== 'object' || !config.version) {
    throw new Error('Source config is invalid. Expected YAML with top-level "version".');
  }
  const rendered = yaml.dump(config, { lineWidth: 120 });
  fs.mkdirSync(absoluteTarget, { recursive: true });
  fs.writeFileSync(outputPath, rendered);

  return {
    outputPath,
    source: options.from ? `file:${path.resolve(options.from)}` : `preset:${type}`,
  };
}

export function getRepotypePresetMetadata() {
  return {
    types: listPresetTypes(),
  };
}

export function installPluginRequirements(target: string) {
  const absolute = path.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path.dirname(configPath);
  const config = loadConfig(configPath);
  const installs = installPlugins(config, repoRoot);
  return {
    repoRoot,
    configPath,
    installs,
    ok: installs.every((entry) => entry.ok),
  };
}

export function pluginStatus(target: string) {
  const absolute = path.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path.dirname(configPath);
  const config = loadConfig(configPath);
  const plugins = describePlugins(config);
  return {
    repoRoot,
    configPath,
    plugins,
  };
}

export async function generateComplianceReport(
  target: string,
  format: ComplianceReportFormat = 'markdown',
  configOverridePath?: string,
) {
  const absolute = path.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path.dirname(configPath);
  const validateResult = await validatePath(target, configOverridePath);

  // Flatten diagnostics for reporting regardless of mode
  const allDiagnostics =
    validateResult.mode === 'workspace'
      ? [
          ...validateResult.result.rootResult.diagnostics,
          ...validateResult.result.workspaces.flatMap((ws) => ws.result.diagnostics),
        ]
      : validateResult.result.diagnostics;
  const ok = validateResult.result.ok;
  const filesScanned = validateResult.result.filesScanned;

  const totals = allDiagnostics.reduce(
    (acc, diagnostic) => {
      if (diagnostic.severity === 'error') acc.errors += 1;
      if (diagnostic.severity === 'warning') acc.warnings += 1;
      if (diagnostic.severity === 'suggestion') acc.suggestions += 1;
      acc.diagnostics += 1;
      return acc;
    },
    { errors: 0, warnings: 0, suggestions: 0, diagnostics: 0 },
  );

  const byCodeMap = new Map<string, { severity: DiagnosticSeverity; count: number }>();
  for (const diagnostic of allDiagnostics) {
    const entry = byCodeMap.get(diagnostic.code);
    if (entry) {
      entry.count += 1;
      continue;
    }
    byCodeMap.set(diagnostic.code, {
      severity: diagnostic.severity,
      count: 1,
    });
  }

  const severityRank: Record<DiagnosticSeverity, number> = {
    error: 0,
    warning: 1,
    suggestion: 2,
  };

  const byCode: ReportCodeSummary[] = [...byCodeMap.entries()]
    .map(([code, value]) => ({ code, severity: value.severity, count: value.count }))
    .sort((a, b) => {
      const severityDiff = severityRank[a.severity] - severityRank[b.severity];
      if (severityDiff !== 0) {
        return severityDiff;
      }
      return b.count - a.count;
    });

  const sampleFindings: ReportFinding[] = allDiagnostics.slice(0, 50).map((diagnostic) => ({
    code: diagnostic.code,
    severity: diagnostic.severity,
    file: diagnostic.file,
    message: diagnostic.message,
  }));

  const report: ComplianceReport = {
    generatedAt: new Date().toISOString(),
    target: absolute,
    repoRoot,
    configPath,
    ok,
    filesScanned,
    totals,
    byCode,
    sampleFindings,
  };

  return {
    ok,
    report,
    rendered: renderComplianceReport(report, format),
  };
}
