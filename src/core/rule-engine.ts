import path from 'node:path';
import { matchesGlob } from './glob.js';
import type {
  EffectiveRuleSet,
  FileRule,
  FolderRule,
  RepoSchemaConfig,
  SchemaBinding,
  TemplateBinding,
} from './types.js';

function normalize(p: string): string {
  return p.replace(/\\\\/g, '/').replace(/^\.\//, '');
}

function folderRuleMatches(rule: FolderRule, relativePath: string): boolean {
  const directory = normalize(path.dirname(relativePath));
  if (rule.path) {
    const rp = normalize(rule.path);
    return directory === rp || directory.startsWith(`${rp}/`);
  }
  if (rule.glob) {
    return matchesGlob(directory, normalize(rule.glob));
  }
  return false;
}

export function resolveEffectiveRules(
  config: RepoSchemaConfig,
  repoRoot: string,
  absoluteFilePath: string,
): EffectiveRuleSet {
  const relativePath = normalize(path.relative(repoRoot, absoluteFilePath));
  const folderRules = (config.folders || []).filter((rule) => folderRuleMatches(rule, relativePath));
  const fileRules = (config.files || []).filter((rule) => typeof rule.glob === 'string' && matchesGlob(relativePath, normalize(rule.glob)));

  const requiredSections = new Set<string>();
  const templateHints = new Set<string>();
  let schema: SchemaBinding | undefined;
  let template: TemplateBinding | undefined;
  let crossReferences: FileRule['crossReferences'];

  for (const rule of fileRules) {
    for (const section of rule.requiredSections || []) {
      requiredSections.add(section);
    }
    for (const hint of rule.templateHints || []) {
      templateHints.add(hint);
    }
    if (rule.schema) {
      schema = rule.schema;
    }
    if (rule.template) {
      template = rule.template;
    }
    if (rule.crossReferences) {
      crossReferences = rule.crossReferences;
    }
  }

  return {
    filePath: relativePath,
    folderRules,
    fileRules,
    requiredSections: [...requiredSections],
    templateHints: [...templateHints],
    schema,
    template,
    crossReferences,
  };
}

export function explainRules(
  config: RepoSchemaConfig,
  repoRoot: string,
  absoluteFilePath: string,
): {
  effective: EffectiveRuleSet;
  reason: string[];
} {
  const effective = resolveEffectiveRules(config, repoRoot, absoluteFilePath);
  const reason = [
    ...effective.folderRules.map((rule) => `Matched folder rule: ${rule.id || rule.path || rule.glob}`),
    ...effective.fileRules.map((rule) => `Matched file rule: ${rule.id || rule.glob}`),
  ];
  return { effective, reason };
}
