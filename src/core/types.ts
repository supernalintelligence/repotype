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
  /** configPath of the workspace that produced this diagnostic (workspace mode only) */
  workspace?: string;
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
  /** Override the severity of forbidden content pattern violations. Defaults to 'error'. */
  forbidContentSeverity?: DiagnosticSeverity;
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
  /** Diagnostic severity when the reference is broken. Defaults to 'error'. */
  severity?: DiagnosticSeverity;
  /** When true, skip validation if the field is absent or empty string. */
  optional?: boolean;
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
  /** Global file index for cross-workspace reference checks (workspace mode only) */
  globalFileIndex?: Set<string>;
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

// ── Workspace mode types ────────────────────────────────────────────────────

export interface WorkspaceEntry {
  configPath: string;   // absolute path to repotype.yaml / repo-schema.yaml
  subtreeRoot: string;  // dirname(configPath) — never ends with trailing slash
  depth: number;        // path segments in subtreeRoot
}

export interface WorkspaceConflict {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  parentConfigPath: string;
  childConfigPath: string;
  details?: Record<string, unknown>;
}

export interface WorkspaceValidationResult {
  ok: boolean;
  mode: 'workspace';
  filesScanned: number;
  workspaces: Array<{
    configPath: string;
    subtreeRoot: string;
    result: ValidationResult;
  }>;
  conflicts: WorkspaceConflict[];
  rootResult: ValidationResult;
}

export interface WorkspaceCache {
  version: 2;
  hash: string;
  generatedAt: string;
  repoRoot: string;
  workspaces: WorkspaceEntry[];
  resolvedConfigs: Record<string, RepoSchemaConfig>;
}

export type ValidateResult =
  | { mode: 'flat'; result: ValidationResult }
  | { mode: 'workspace'; result: WorkspaceValidationResult };
