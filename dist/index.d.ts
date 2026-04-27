import { UniversalCommand } from '@supernal/universal-command';

type DiagnosticSeverity = 'error' | 'warning' | 'suggestion';
interface AutofixAction {
    type: 'add_frontmatter_field' | 'add_section' | 'remove_template_hint';
    file: string;
    payload: Record<string, unknown>;
    safe: boolean;
}
interface Diagnostic {
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
interface ValidationResult {
    ok: boolean;
    diagnostics: Diagnostic[];
    filesScanned: number;
}
interface SectionRule {
    required: string[];
}
interface SchemaBinding {
    kind: 'frontmatter' | 'json' | 'yaml';
    schema: string;
}
interface TemplateBinding {
    id: string;
    enforce?: boolean;
}
interface FolderRule {
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
interface FileRule {
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
interface TemplateConfig {
    id: string;
    path: string;
    description?: string;
}
interface CrossFileRule {
    id: string;
    kind: 'companion' | 'cross_reference';
    sourceGlob: string;
    target?: string;
    field?: string;
}
interface RepoSchemaConfig {
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
interface EffectiveRuleSet {
    filePath: string;
    folderRules: FolderRule[];
    fileRules: FileRule[];
    requiredSections: string[];
    templateHints: string[];
    schema?: SchemaBinding;
    template?: TemplateBinding;
    crossReferences?: FileRule['crossReferences'];
}
interface ValidatorContext {
    repoRoot: string;
    configPath: string;
    config: RepoSchemaConfig;
    ruleSet: EffectiveRuleSet;
    /** Global file index for cross-workspace reference checks (workspace mode only) */
    globalFileIndex?: Set<string>;
}
interface ValidatorAdapter {
    id: string;
    supports(filePath: string, context: ValidatorContext): boolean;
    validate(filePath: string, context: ValidatorContext): Promise<Diagnostic[]>;
}
interface ValidateOptions {
    targetPath: string;
    json?: boolean;
}
interface FixResult {
    applied: number;
    diagnostics: Diagnostic[];
}
interface PluginCommand {
    cmd: string;
    cwd?: string;
}
interface PluginRequirement {
    id: string;
    description?: string;
    enabled?: boolean;
    install?: PluginCommand[];
    validate?: PluginCommand;
    fix?: PluginCommand;
    severityOnFailure?: DiagnosticSeverity;
}
interface WorkspaceEntry {
    configPath: string;
    subtreeRoot: string;
    depth: number;
}
interface WorkspaceConflict {
    code: string;
    severity: 'error' | 'warning';
    message: string;
    parentConfigPath: string;
    childConfigPath: string;
    details?: Record<string, unknown>;
}
interface WorkspaceValidationResult {
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
interface WorkspaceCache {
    version: 2;
    hash: string;
    generatedAt: string;
    repoRoot: string;
    workspaces: WorkspaceEntry[];
    resolvedConfigs: Record<string, RepoSchemaConfig>;
}
type ValidateResult = {
    mode: 'flat';
    result: ValidationResult;
} | {
    mode: 'workspace';
    result: WorkspaceValidationResult;
};

interface IgnoreMatcher {
    isIgnored(absolutePath: string): boolean;
}

declare function findConfig(startPath: string): string;
declare function loadConfig(configPath: string): RepoSchemaConfig;
/**
 * Collect the transitive set of config files referenced via `extends`.
 * Returns all files in the extends chain starting from configPath.
 */
declare function collectExtendsDeps(configPath: string, seen?: Set<string>): string[];
/**
 * Compute a SHA-256 hash of all config + extends files.
 * Paths are sorted before hashing for stability.
 */
declare function hashConfigFiles(configPaths: string[]): string;
/**
 * Discover child workspace configs under rootDir.
 * Returns WorkspaceEntry[] sorted deepest-first (then alphabetically for ties).
 * The root config itself is excluded.
 */
declare function discoverWorkspaces(rootDir: string, ignoreMatcher: IgnoreMatcher): WorkspaceEntry[];
/**
 * Determine which WorkspaceEntry owns a given absolute file path.
 * Workspaces must be sorted deepest-first.
 */
declare function resolveOwningWorkspace(absoluteFilePath: string, workspaces: WorkspaceEntry[]): WorkspaceEntry | 'root';
declare function loadWorkspaceCache(repoRoot: string): WorkspaceCache | null;
declare function writeWorkspaceCache(repoRoot: string, cache: WorkspaceCache): void;

type RepotypePresetType = 'default' | 'strict';
declare function createPresetConfig(type: RepotypePresetType): RepoSchemaConfig;
declare function listPresetTypes(): RepotypePresetType[];

declare function resolveEffectiveRules(config: RepoSchemaConfig, repoRoot: string, absoluteFilePath: string): EffectiveRuleSet;
declare function explainRules(config: RepoSchemaConfig, repoRoot: string, absoluteFilePath: string): {
    effective: EffectiveRuleSet;
    reason: string[];
};

declare function generateFrontmatterSchemaFromContent(targetPath: string, outputPath: string, pattern?: string): {
    output: string;
    filesConsidered: number;
    filesParsed: number;
    filesFailed: number;
    required: string[];
    properties: string[];
};

declare function runPluginPhase(config: RepoSchemaConfig, repoRoot: string, phase: 'validate' | 'fix'): Diagnostic[];
declare function installPlugins(config: RepoSchemaConfig, repoRoot: string): Array<{
    id: string;
    ok: boolean;
    command: string;
    code: number;
    output?: string;
}>;
declare function describePlugins(config: RepoSchemaConfig): Array<{
    id: string;
    enabled: boolean;
    hasInstall: boolean;
    hasValidate: boolean;
    hasFix: boolean;
}>;

declare function renderTemplate(config: RepoSchemaConfig, repoRoot: string, templateId: string, variables: Record<string, unknown>): string;

declare function scanFiles(targetPath: string, repoRoot: string, sharedIgnoreMatcher?: IgnoreMatcher): string[];
declare class ValidationEngine {
    private readonly adapters;
    constructor(adapters: ValidatorAdapter[]);
    validate(targetPath: string, options?: {
        configPath?: string;
        sharedIgnoreMatcher?: IgnoreMatcher;
        globalFileIndex?: Set<string>;
        workspaceTag?: string;
        /** Pre-computed file list; when provided, skips scanFiles entirely. */
        fileList?: string[];
    }): Promise<ValidationResult>;
    /**
     * Validate a workspace (root + all child workspace subtrees) in parallel.
     * Auto-detects child configs under rootDir.
     */
    validateWorkspace(rootDir: string, options?: {
        noCache?: boolean;
        workspaceEnabled?: boolean;
    }): Promise<ValidateResult>;
}

interface ReportCodeSummary {
    code: string;
    severity: DiagnosticSeverity;
    count: number;
}
interface ReportFinding {
    code: string;
    severity: DiagnosticSeverity;
    file: string;
    message: string;
}
interface ComplianceReport {
    generatedAt: string;
    target: string;
    repoRoot: string;
    configPath: string;
    ok: boolean;
    filesScanned: number;
    totals: {
        errors: number;
        warnings: number;
        suggestions: number;
        diagnostics: number;
    };
    byCode: ReportCodeSummary[];
    sampleFindings: ReportFinding[];
}
type ComplianceReportFormat = 'markdown' | 'json' | 'html';
declare function parseComplianceReportJson(json: string): ComplianceReport;
declare function renderMarkdownComplianceReport(report: ComplianceReport): string;
declare function renderHtmlComplianceReport(report: ComplianceReport): string;
declare function renderComplianceReport(report: ComplianceReport, format?: ComplianceReportFormat): string;
declare function renderComplianceReportFromJson(json: string, format?: ComplianceReportFormat): string;

declare function validatePath(target: string, configOverridePath?: string, opts?: {
    workspace?: boolean;
    noCache?: boolean;
}): Promise<ValidateResult>;
declare function explainPath(target: string, configOverridePath?: string): {
    effective: EffectiveRuleSet;
    reason: string[];
};
declare function fixPath(target: string, configOverridePath?: string, opts?: {
    workspace?: boolean;
    noCache?: boolean;
}): Promise<{
    validation: {
        mode: "workspace";
        result: WorkspaceValidationResult;
    };
    fix: {
        applied: number;
    };
    workspaceFixes: {
        root: FixResult;
        children: {
            configPath: string;
            subtreeRoot: string;
            fix: FixResult;
        }[];
    };
} | {
    validation: {
        mode: "flat";
        result: {
            diagnostics: Diagnostic[];
            ok: boolean;
            filesScanned: number;
        };
    };
    fix: FixResult;
    workspaceFixes?: undefined;
}>;
declare function scaffoldFromTemplate(templateId: string, outputPath: string, variables: Record<string, unknown>): string;
declare function generateSchemaFromContent(target: string, output: string, pattern?: string): {
    output: string;
    filesConsidered: number;
    filesParsed: number;
    filesFailed: number;
    required: string[];
    properties: string[];
};
declare function initRepotypeConfig(targetDir: string, options?: {
    type?: RepotypePresetType;
    from?: string;
    force?: boolean;
}): {
    outputPath: string;
    source: string;
};
declare function getRepotypePresetMetadata(): {
    types: RepotypePresetType[];
};
declare function installPluginRequirements(target: string): {
    repoRoot: string;
    configPath: string;
    installs: {
        id: string;
        ok: boolean;
        command: string;
        code: number;
        output?: string;
    }[];
    ok: boolean;
};
declare function pluginStatus(target: string): {
    repoRoot: string;
    configPath: string;
    plugins: {
        id: string;
        enabled: boolean;
        hasInstall: boolean;
        hasValidate: boolean;
        hasFix: boolean;
    }[];
};
declare function generateComplianceReport(target: string, format?: ComplianceReportFormat, configOverridePath?: string): Promise<{
    ok: boolean;
    report: ComplianceReport;
    rendered: string;
}>;

interface InstallChecksOptions {
    target: string;
    hook: 'pre-commit' | 'pre-push' | 'both';
}
declare function installChecks(options: InstallChecksOptions): {
    repoRoot: string;
    hooks: Array<{
        hook: string;
        status: 'created' | 'updated' | 'unchanged';
        path: string;
    }>;
};
declare function inspectChecks(target: string): {
    repoRoot: string;
    hooks: Array<{
        hook: 'pre-commit' | 'pre-push';
        path: string;
        exists: boolean;
        managed: boolean;
    }>;
};
declare function uninstallChecks(options: InstallChecksOptions): {
    repoRoot: string;
    hooks: Array<{
        hook: string;
        status: 'removed' | 'unchanged' | 'not_found';
        path: string;
    }>;
};

interface InstallWatcherOptions {
    target: string;
    schedule: string;
    queueDir: string;
    minErrors: number;
    logFile: string;
    dryRun?: boolean;
}
declare function installWatcher(options: InstallWatcherOptions): {
    marker: string;
    schedule: string;
    command: string;
    line: string;
    changed: boolean;
};
declare function inspectWatcher(target: string): {
    marker: string;
    installed: boolean;
    line?: string;
};
declare function uninstallWatcher(target: string, dryRun?: boolean): {
    marker: string;
    removed: boolean;
    changed: boolean;
};

interface NormalizedOperationsConfig {
    hooks: {
        enabled: boolean;
        hook: 'pre-commit' | 'pre-push' | 'both';
    };
    watcher: {
        enabled: boolean;
        schedule: string;
        queueDir: string;
        minErrors: number;
        logFile: string;
    };
}
declare function getOperationsStatus(target: string): {
    repoRoot: string;
    configPath: string;
    config: NormalizedOperationsConfig;
    hooks: ReturnType<typeof inspectChecks>;
    watcher: ReturnType<typeof inspectWatcher>;
    cleanup: {
        queueDir: string;
        lastRun: {
            found: boolean;
            entry?: Record<string, unknown>;
        };
    };
    workspace: {
        mode: 'flat' | 'workspace';
        childCount: number;
        children: Array<{
            configPath: string;
            subtreeRoot: string;
        }>;
    };
};
declare function applyOperationsConfig(target: string): {
    repoRoot: string;
    configPath: string;
    applied: {
        hooks: ReturnType<typeof installChecks> | ReturnType<typeof uninstallChecks>;
        watcher: ReturnType<typeof installWatcher> | ReturnType<typeof uninstallWatcher>;
    };
};

declare function startService(options: {
    port: number;
    cwd: string;
}): Promise<void>;

declare const repotypeValidateCommand: UniversalCommand<{
    target?: string;
    config?: string;
}, {
    ok: boolean;
    filesScanned: number;
    diagnostics: unknown[];
}>;
declare const repotypeExplainCommand: UniversalCommand<{
    file: string;
    config?: string;
}, {
    reason: string[];
    effective: unknown;
}>;
declare const repotypeStatusCommand: UniversalCommand<{
    target?: string;
}, {
    repoRoot: string;
    configPath: string;
    config: NormalizedOperationsConfig;
    hooks: ReturnType<typeof inspectChecks>;
    watcher: ReturnType<typeof inspectWatcher>;
    cleanup: {
        queueDir: string;
        lastRun: {
            found: boolean;
            entry?: Record<string, unknown>;
        };
    };
    workspace: {
        mode: "flat" | "workspace";
        childCount: number;
        children: Array<{
            configPath: string;
            subtreeRoot: string;
        }>;
    };
}>;
declare const repotypeApplyCommand: UniversalCommand<{
    target?: string;
}, {
    repoRoot: string;
    configPath: string;
    applied: {
        hooks: ReturnType<typeof installChecks> | ReturnType<typeof uninstallChecks>;
        watcher: ReturnType<typeof installWatcher> | ReturnType<typeof uninstallWatcher>;
    };
}>;
declare const repotypeReportCommand: UniversalCommand<{
    target?: string;
    format?: "markdown" | "json" | "html";
    config?: string;
}, {
    ok: boolean;
    report: ComplianceReport;
    rendered: string;
}>;
declare const repotypeFixCommand: UniversalCommand<{
    target?: string;
    config?: string;
}, {
    validation: {
        mode: "workspace";
        result: WorkspaceValidationResult;
    };
    fix: {
        applied: number;
    };
    workspaceFixes: {
        root: FixResult;
        children: {
            configPath: string;
            subtreeRoot: string;
            fix: FixResult;
        }[];
    };
} | {
    validation: {
        mode: "flat";
        result: {
            diagnostics: Diagnostic[];
            ok: boolean;
            filesScanned: number;
        };
    };
    fix: FixResult;
    workspaceFixes?: undefined;
}>;
declare const repotypeCleanupRunCommand: UniversalCommand<{
    target?: string;
    queue?: string;
    minErrors?: number;
    dryRun?: boolean;
}, {
    scanned: number;
    candidates: number;
    moved: number;
    entries: Array<{
        source: string;
        destination: string;
        errorCount: number;
        moved: boolean;
    }>;
}>;
declare const repotypeInstallChecksCommand: UniversalCommand<{
    target?: string;
    hook?: "pre-commit" | "pre-push" | "both";
}, {
    repoRoot: string;
    hooks: Array<{
        hook: string;
        status: "created" | "updated" | "unchanged";
        path: string;
    }>;
}>;
declare const repotypeInstallWatcherCommand: UniversalCommand<{
    target?: string;
    schedule?: string;
    queue?: string;
    minErrors?: number;
    logFile?: string;
    dryRun?: boolean;
}, {
    marker: string;
    schedule: string;
    command: string;
    line: string;
    changed: boolean;
}>;
declare const repotypeScaffoldCommand: UniversalCommand<{
    templateId: string;
    output: string;
    set?: string[];
}, {
    created: string;
}>;
declare const repotypeGenerateSchemaCommand: UniversalCommand<{
    target: string;
    output: string;
    pattern?: string;
}, {
    output: string;
    filesConsidered: number;
    filesParsed: number;
    filesFailed: number;
    required: string[];
    properties: string[];
}>;
declare const repotypeInitCommand: UniversalCommand<{
    target?: string;
    type?: "default" | "strict";
    from?: string;
    force?: boolean;
}, {
    outputPath: string;
    source: string;
}>;
declare const repotypePluginsStatusCommand: UniversalCommand<{
    target?: string;
}, {
    repoRoot: string;
    configPath: string;
    plugins: {
        id: string;
        enabled: boolean;
        hasInstall: boolean;
        hasValidate: boolean;
        hasFix: boolean;
    }[];
}>;
declare const repotypePluginsInstallCommand: UniversalCommand<{
    target?: string;
}, {
    repoRoot: string;
    configPath: string;
    installs: {
        id: string;
        ok: boolean;
        command: string;
        code: number;
        output?: string;
    }[];
    ok: boolean;
}>;

export { type AutofixAction, type ComplianceReport, type ComplianceReportFormat, type CrossFileRule, type Diagnostic, type DiagnosticSeverity, type EffectiveRuleSet, type FileRule, type FixResult, type FolderRule, type NormalizedOperationsConfig, type PluginCommand, type PluginRequirement, type RepoSchemaConfig, type ReportCodeSummary, type ReportFinding, type RepotypePresetType, type SchemaBinding, type SectionRule, type TemplateBinding, type TemplateConfig, type ValidateOptions, type ValidateResult, ValidationEngine, type ValidationResult, type ValidatorAdapter, type ValidatorContext, type WorkspaceCache, type WorkspaceConflict, type WorkspaceEntry, type WorkspaceValidationResult, applyOperationsConfig, collectExtendsDeps, createPresetConfig, describePlugins, discoverWorkspaces, explainPath, explainRules, findConfig, fixPath, generateComplianceReport, generateFrontmatterSchemaFromContent, generateSchemaFromContent, getOperationsStatus, getRepotypePresetMetadata, hashConfigFiles, initRepotypeConfig, installPluginRequirements, installPlugins, listPresetTypes, loadConfig, loadWorkspaceCache, parseComplianceReportJson, pluginStatus, renderComplianceReport, renderComplianceReportFromJson, renderHtmlComplianceReport, renderMarkdownComplianceReport, renderTemplate, repotypeApplyCommand, repotypeCleanupRunCommand, repotypeExplainCommand, repotypeFixCommand, repotypeGenerateSchemaCommand, repotypeInitCommand, repotypeInstallChecksCommand, repotypeInstallWatcherCommand, repotypePluginsInstallCommand, repotypePluginsStatusCommand, repotypeReportCommand, repotypeScaffoldCommand, repotypeStatusCommand, repotypeValidateCommand, resolveEffectiveRules, resolveOwningWorkspace, runPluginPhase, scaffoldFromTemplate, scanFiles, startService, validatePath, writeWorkspaceCache };
