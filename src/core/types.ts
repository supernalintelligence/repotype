export type DiagnosticSeverity = 'error' | 'warning' | 'suggestion';

export interface AutofixAction {
  type: 'add_frontmatter_field' | 'add_section' | 'remove_template_hint';
  file: string;
  payload: Record<string, unknown>;
  safe: boolean;
}

export interface Diagnostic {
  code: string;
  message: string;
  severity: DiagnosticSeverity;
  file: string;
  ruleId?: string;
  details?: Record<string, unknown>;
  autofix?: AutofixAction;
}

export interface ValidationResult {
  ok: boolean;
  diagnostics: Diagnostic[];
  filesScanned: number;
}

export interface SectionRule {
  required: string[];
}

export interface SchemaBinding {
  kind: 'frontmatter' | 'json' | 'yaml';
  schema: string;
}

export interface TemplateBinding {
  id: string;
  enforce?: boolean;
}

export interface FolderRule {
  id?: string;
  path?: string;
  glob?: string;
  inherit?: boolean;
  allowedFiles?: string[];
  requiredFiles?: string[];
  requiredFolders?: string[];
  allowedFolders?: string[];
  schemaBindings?: Record<string, SchemaBinding>;
  templateBindings?: Record<string, TemplateBinding>;
}

export interface FileRule {
  id?: string;
  glob: string;
  filenamePattern?: string;
  pathPattern?: string;
  pathCase?: 'kebab' | 'snake' | 'camel' | 'lower';
  templateHints?: string[];
  forbidContentPatterns?: string[];
  schema?: SchemaBinding;
  requiredSections?: string[];
  companionFiles?: string[];
  template?: TemplateBinding;
  // Lint controls for config quality checks (e.g., overbroad glob warnings)
  lint?: {
    allowOverbroad?: boolean;
    reason?: string;
  };
  crossReferences?: {
    fields: string[];
    allowAbsolute?: boolean;
    allowedExtensions?: string[];
  };
}

export interface TemplateConfig {
  id: string;
  path: string;
  description?: string;
}

export interface CrossFileRule {
  id: string;
  kind: 'companion' | 'cross_reference';
  sourceGlob: string;
  target?: string;
  field?: string;
}

export interface RepoSchemaConfig {
  version: string;
  extends?: string | string[];
  defaults?: {
    inheritance?: 'merge' | 'replace';
    strictness?: 'strict' | 'balanced' | 'lenient';
    unmatchedFiles?: 'deny' | 'allow';
  };
  operations?: {
    hooks?: {
      enabled?: boolean;
      hook?: 'pre-commit' | 'pre-push' | 'both';
    };
    watcher?: {
      enabled?: boolean;
      schedule?: string;
      queueDir?: string;
      minErrors?: number;
      logFile?: string;
    };
  };
  folders?: FolderRule[];
  files?: FileRule[];
  templates?: TemplateConfig[];
  rules?: CrossFileRule[];
  plugins?: PluginRequirement[];
}

export interface EffectiveRuleSet {
  filePath: string;
  folderRules: FolderRule[];
  fileRules: FileRule[];
  requiredSections: string[];
  templateHints: string[];
  schema?: SchemaBinding;
  template?: TemplateBinding;
  crossReferences?: FileRule['crossReferences'];
}

export interface ValidatorContext {
  repoRoot: string;
  configPath: string;
  config: RepoSchemaConfig;
  ruleSet: EffectiveRuleSet;
}

export interface ValidatorAdapter {
  id: string;
  supports(filePath: string, context: ValidatorContext): boolean;
  validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]>;
}

export interface ValidateOptions {
  targetPath: string;
  json?: boolean;
}

export interface FixResult {
  applied: number;
  diagnostics: Diagnostic[];
}

export interface PluginCommand {
  cmd: string;
  cwd?: string;
}

export interface PluginRequirement {
  id: string;
  description?: string;
  enabled?: boolean;
  install?: PluginCommand[];
  validate?: PluginCommand;
  fix?: PluginCommand;
  severityOnFailure?: DiagnosticSeverity;
}
