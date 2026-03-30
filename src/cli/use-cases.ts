import fs from 'node:fs';
import path from 'node:path';
import { applyAutofixes } from '../core/autofix.js';
import { findConfig, loadConfig } from '../core/config-loader.js';
import { describePlugins, installPlugins, runPluginPhase } from '../core/plugin-runner.js';
import { generateFrontmatterSchemaFromContent } from '../core/schema-generator.js';
import { explainRules } from '../core/rule-engine.js';
import { renderTemplate } from '../core/template-engine.js';
import type { AutofixAction } from '../core/types.js';
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

export async function validatePath(target: string, configOverridePath?: string) {
  const absolute = path.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path.dirname(configPath);
  const config = loadConfig(configPath);
  const engine = createDefaultEngine();
  const result = await engine.validate(target, { configPath });
  const pluginDiagnostics = runPluginPhase(config, repoRoot, 'validate');
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];

  return {
    ...result,
    diagnostics,
    ok: diagnostics.every((d) => d.severity !== 'error'),
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

export async function fixPath(target: string, configOverridePath?: string) {
  const absolute = path.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path.dirname(configPath);
  const config = loadConfig(configPath);
  const result = await validatePath(target, configPath);
  const actions: AutofixAction[] = result.diagnostics
    .map((d) => d.autofix)
    .filter((action): action is AutofixAction => Boolean(action));

  const fixResult = applyAutofixes(actions);
  const pluginDiagnostics = runPluginPhase(config, repoRoot, 'fix');
  const validation = {
    ...result,
    diagnostics: [...result.diagnostics, ...pluginDiagnostics],
  };
  validation.ok = validation.diagnostics.every((d) => d.severity !== 'error');

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
  const result = await validatePath(target, configPath);

  const totals = result.diagnostics.reduce(
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
  for (const diagnostic of result.diagnostics) {
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

  const sampleFindings: ReportFinding[] = result.diagnostics.slice(0, 50).map((diagnostic) => ({
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
    ok: result.ok,
    filesScanned: result.filesScanned,
    totals,
    byCode,
    sampleFindings,
  };

  return {
    ok: result.ok,
    report,
    rendered: renderComplianceReport(report, format),
  };
}
