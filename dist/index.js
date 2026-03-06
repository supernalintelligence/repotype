// src/core/config-loader.ts
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
function findConfig(startPath) {
  const resolved = path.resolve(startPath);
  const exists = fs.existsSync(resolved);
  const initial = exists ? fs.statSync(resolved).isDirectory() ? resolved : path.dirname(resolved) : path.dirname(resolved);
  let dir = initial;
  while (true) {
    const candidates = ["repotype.yaml", "repo-schema.yaml"];
    for (const name of candidates) {
      const candidate = path.join(dir, name);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("No schema config found. Expected repotype.yaml or repo-schema.yaml");
    }
    dir = parent;
  }
}
function parseConfigFile(configPath) {
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = yaml.load(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid schema configuration in ${configPath}`);
  }
  return parsed;
}
function asArray(input) {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}
function mergeConfig(base, override) {
  const merged = {
    version: override.version || base.version,
    defaults: {
      ...base.defaults,
      ...override.defaults
    },
    operations: {
      hooks: {
        ...base.operations?.hooks,
        ...override.operations?.hooks
      },
      watcher: {
        ...base.operations?.watcher,
        ...override.operations?.watcher
      }
    },
    folders: [...base.folders || [], ...override.folders || []],
    files: [...base.files || [], ...override.files || []],
    templates: [...base.templates || [], ...override.templates || []],
    rules: [...base.rules || [], ...override.rules || []],
    plugins: [...base.plugins || [], ...override.plugins || []]
  };
  if (!merged.defaults || Object.keys(merged.defaults).length === 0) {
    delete merged.defaults;
  }
  if (!merged.operations || (!merged.operations.hooks || Object.keys(merged.operations.hooks).length === 0) && (!merged.operations.watcher || Object.keys(merged.operations.watcher).length === 0)) {
    delete merged.operations;
  }
  if (merged.folders?.length === 0) delete merged.folders;
  if (merged.files?.length === 0) delete merged.files;
  if (merged.templates?.length === 0) delete merged.templates;
  if (merged.rules?.length === 0) delete merged.rules;
  if (merged.plugins?.length === 0) delete merged.plugins;
  return merged;
}
function loadConfigRecursive(configPath, loading) {
  const absolutePath = path.resolve(configPath);
  if (loading.has(absolutePath)) {
    throw new Error(`Circular config extends detected at ${absolutePath}`);
  }
  loading.add(absolutePath);
  const parsed = parseConfigFile(absolutePath);
  const parents = asArray(parsed.extends);
  let merged = {
    version: ""
  };
  for (const parentRef of parents) {
    const parentPath = path.resolve(path.dirname(absolutePath), parentRef);
    if (!fs.existsSync(parentPath)) {
      throw new Error(`Extended config not found: ${parentPath} (from ${absolutePath})`);
    }
    const parentConfig = loadConfigRecursive(parentPath, loading);
    merged = mergeConfig(merged, parentConfig);
  }
  const current = {
    ...parsed
  };
  delete current.extends;
  merged = mergeConfig(merged, current);
  loading.delete(absolutePath);
  if (!merged.version) {
    throw new Error(`Missing required field: version in ${absolutePath} (or inherited configs)`);
  }
  return merged;
}
function loadConfig(configPath) {
  return loadConfigRecursive(configPath, /* @__PURE__ */ new Set());
}

// src/core/presets.ts
function baseDefaults() {
  return {
    inheritance: "merge",
    strictness: "balanced"
  };
}
function defaultPreset() {
  return {
    version: "1",
    defaults: baseDefaults(),
    folders: [
      {
        id: "docs-root",
        path: "docs",
        requiredFolders: ["requirements"]
      }
    ],
    files: [
      {
        id: "requirement-md",
        glob: "docs/requirements/**/*.md",
        filenamePattern: "^req-[a-z0-9-]+\\.md$",
        requiredSections: ["Description", "Acceptance Criteria", "Test Strategy"]
      }
    ]
  };
}
function createPresetConfig(type) {
  if (type !== "default") {
    throw new Error(`Unsupported preset type '${type}'.`);
  }
  return defaultPreset();
}
function listPresetTypes() {
  return ["default"];
}

// src/core/rule-engine.ts
import path2 from "path";

// src/core/glob.ts
import { minimatch } from "minimatch";
function matchesGlob(pathValue, glob) {
  return minimatch(pathValue, glob, { dot: true, nocase: false, nocomment: true });
}

// src/core/rule-engine.ts
function normalize(p) {
  return p.replace(/\\\\/g, "/").replace(/^\.\//, "");
}
function folderRuleMatches(rule, relativePath) {
  const directory = normalize(path2.dirname(relativePath));
  if (rule.path) {
    const rp = normalize(rule.path);
    return directory === rp || directory.startsWith(`${rp}/`);
  }
  if (rule.glob) {
    return matchesGlob(directory, normalize(rule.glob));
  }
  return false;
}
function resolveEffectiveRules(config, repoRoot, absoluteFilePath) {
  const relativePath = normalize(path2.relative(repoRoot, absoluteFilePath));
  const folderRules = (config.folders || []).filter((rule) => folderRuleMatches(rule, relativePath));
  const fileRules = (config.files || []).filter((rule) => matchesGlob(relativePath, normalize(rule.glob)));
  const requiredSections = /* @__PURE__ */ new Set();
  const templateHints = /* @__PURE__ */ new Set();
  let schema;
  let template;
  let crossReferences;
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
    crossReferences
  };
}
function explainRules(config, repoRoot, absoluteFilePath) {
  const effective = resolveEffectiveRules(config, repoRoot, absoluteFilePath);
  const reason = [
    ...effective.folderRules.map((rule) => `Matched folder rule: ${rule.id || rule.path || rule.glob}`),
    ...effective.fileRules.map((rule) => `Matched file rule: ${rule.id || rule.glob}`)
  ];
  return { effective, reason };
}

// src/core/schema-generator.ts
import fs3 from "fs";
import path3 from "path";
import { globSync } from "glob";

// src/core/markdown.ts
import fs2 from "fs";
import yaml2 from "js-yaml";
function parseMarkdown(filePath) {
  const raw = fs2.readFileSync(filePath, "utf8");
  return parseMarkdownContent(raw);
}
function parseMarkdownContent(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: {},
      body: raw,
      raw
    };
  }
  const fmRaw = match[1];
  const body = match[2] || "";
  const parsed = yaml2.load(fmRaw) || {};
  return {
    frontmatter: parsed,
    body,
    raw
  };
}
function serializeMarkdown(frontmatter, body) {
  const fm = yaml2.dump(frontmatter, { lineWidth: -1, noRefs: true }).trimEnd();
  return `---
${fm}
---

${body.trimStart()}`;
}
function extractSections(markdownBody) {
  const matches = markdownBody.match(/^##+\s+(.+)$/gm) || [];
  return matches.map((line) => line.replace(/^##+\s+/, "").trim());
}

// src/core/schema-generator.ts
function inferType(value) {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return Number.isInteger(value) ? "integer" : "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    default:
      return "string";
  }
}
function inferArrayItems(values) {
  const itemTypes = /* @__PURE__ */ new Set();
  for (const value of values) {
    if (Array.isArray(value)) {
      for (const item of value) {
        itemTypes.add(inferType(item));
      }
    }
  }
  if (itemTypes.size === 0) {
    return {};
  }
  if (itemTypes.size === 1) {
    return { type: [...itemTypes][0] };
  }
  return {
    anyOf: [...itemTypes].map((type) => ({ type }))
  };
}
function inferPropertySchema(values) {
  const types = new Set(values.map((value) => inferType(value)));
  if (types.size === 0) {
    return {};
  }
  if (types.size === 1) {
    const only = [...types][0];
    if (only === "array") {
      return {
        type: "array",
        items: inferArrayItems(values)
      };
    }
    return { type: only };
  }
  return {
    anyOf: [...types].map(
      (type) => type === "array" ? { type: "array", items: inferArrayItems(values) } : { type }
    )
  };
}
function discoverMarkdownFiles(targetPath, pattern) {
  const absolute = path3.resolve(targetPath);
  const stat = fs3.statSync(absolute);
  if (stat.isFile()) {
    return [absolute];
  }
  return globSync(pattern, {
    cwd: absolute,
    absolute: true,
    nodir: true,
    ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"]
  });
}
function generateFrontmatterSchemaFromContent(targetPath, outputPath, pattern = "**/*.md") {
  const files = discoverMarkdownFiles(targetPath, pattern);
  const aggregate = /* @__PURE__ */ new Map();
  let filesParsed = 0;
  let filesFailed = 0;
  for (const file of files) {
    try {
      const parsed = parseMarkdown(file);
      const frontmatter = parsed.frontmatter || {};
      filesParsed += 1;
      for (const [key, value] of Object.entries(frontmatter)) {
        const current = aggregate.get(key) || { count: 0, values: [] };
        current.count += 1;
        current.values.push(value);
        aggregate.set(key, current);
      }
    } catch {
      filesFailed += 1;
    }
  }
  const properties = {};
  const required = [];
  for (const [key, entry] of aggregate.entries()) {
    properties[key] = inferPropertySchema(entry.values);
    if (filesParsed > 0 && entry.count === filesParsed) {
      required.push(key);
    }
  }
  const schema = {
    type: "object",
    required: required.sort(),
    properties,
    additionalProperties: true
  };
  const outputAbsolute = path3.resolve(outputPath);
  fs3.mkdirSync(path3.dirname(outputAbsolute), { recursive: true });
  fs3.writeFileSync(outputAbsolute, `${JSON.stringify(schema, null, 2)}
`);
  return {
    output: outputAbsolute,
    filesConsidered: files.length,
    filesParsed,
    filesFailed,
    required: required.sort(),
    properties: Object.keys(properties).sort()
  };
}

// src/core/plugin-runner.ts
import path4 from "path";
import { execSync } from "child_process";
function runCommand(command, repoRoot) {
  const cwd = command.cwd ? path4.resolve(repoRoot, command.cwd) : repoRoot;
  try {
    const output = execSync(command.cmd, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      shell: process.env.SHELL || "/bin/sh",
      env: process.env
    });
    return { ok: true, output: output?.trim?.() || "", code: 0 };
  } catch (error) {
    const stdout = typeof error?.stdout === "string" ? error.stdout : "";
    const stderr = typeof error?.stderr === "string" ? error.stderr : "";
    const output = `${stdout}
${stderr}`.trim();
    return {
      ok: false,
      output,
      code: typeof error?.status === "number" ? error.status : 1
    };
  }
}
function isEnabled(plugin) {
  return plugin.enabled !== false;
}
function asFailureSeverity(plugin) {
  const severity = plugin.severityOnFailure || "error";
  if (severity === "warning" || severity === "suggestion") {
    return severity;
  }
  return "error";
}
function runPluginPhase(config, repoRoot, phase) {
  const diagnostics = [];
  const plugins = config.plugins || [];
  for (const plugin of plugins) {
    if (!isEnabled(plugin)) {
      continue;
    }
    const command = phase === "validate" ? plugin.validate : plugin.fix;
    if (!command) {
      continue;
    }
    const result = runCommand(command, repoRoot);
    if (result.ok) {
      diagnostics.push({
        code: `plugin_${phase}_ok`,
        message: `Plugin '${plugin.id}' ${phase} command succeeded`,
        severity: "suggestion",
        file: repoRoot,
        ruleId: plugin.id,
        details: {
          command: command.cmd,
          output: result.output || void 0
        }
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
        output: result.output || void 0
      }
    });
  }
  return diagnostics;
}
function installPlugins(config, repoRoot) {
  const results = [];
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
        output: result.output || void 0
      });
    }
  }
  return results;
}
function describePlugins(config) {
  return (config.plugins || []).map((plugin) => ({
    id: plugin.id,
    enabled: isEnabled(plugin),
    hasInstall: Boolean(plugin.install && plugin.install.length > 0),
    hasValidate: Boolean(plugin.validate),
    hasFix: Boolean(plugin.fix)
  }));
}

// src/core/template-engine.ts
import fs4 from "fs";
import path5 from "path";
import Handlebars from "handlebars";
function renderTemplate(config, repoRoot, templateId, variables) {
  const template = (config.templates || []).find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  const templatePath = path5.resolve(repoRoot, template.path);
  const source = fs4.readFileSync(templatePath, "utf8");
  const compiled = Handlebars.compile(source, { noEscape: true });
  return compiled(variables);
}

// src/core/validator-framework.ts
import fs5 from "fs";
import path6 from "path";
import { globSync as globSync2 } from "glob";
function scanFiles(targetPath) {
  const stats = fs5.statSync(targetPath);
  if (stats.isFile()) {
    return [path6.resolve(targetPath)];
  }
  return globSync2("**/*", {
    cwd: targetPath,
    absolute: true,
    nodir: true,
    ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"]
  });
}
var ValidationEngine = class {
  constructor(adapters) {
    this.adapters = adapters;
  }
  async validate(targetPath, options) {
    const absoluteTarget = path6.resolve(targetPath);
    const targetRoot = fs5.existsSync(absoluteTarget) && fs5.statSync(absoluteTarget).isDirectory() ? absoluteTarget : path6.dirname(absoluteTarget);
    const configPath = options?.configPath ? path6.resolve(options.configPath) : findConfig(absoluteTarget);
    const repoRoot = options?.configPath ? targetRoot : path6.dirname(configPath);
    const config = loadConfig(configPath);
    const files = scanFiles(absoluteTarget);
    const diagnostics = [];
    for (const filePath of files) {
      const ruleSet = resolveEffectiveRules(config, repoRoot, filePath);
      const context = {
        repoRoot,
        configPath,
        config,
        ruleSet
      };
      for (const adapter of this.adapters) {
        if (!adapter.supports(filePath, context)) {
          continue;
        }
        try {
          const adapterDiagnostics = await adapter.validate(filePath, context);
          diagnostics.push(...adapterDiagnostics);
        } catch (error) {
          diagnostics.push({
            code: "validator_adapter_failure",
            message: `${adapter.id} failed for ${context.ruleSet.filePath}: ${error.message}`,
            severity: "error",
            file: filePath,
            details: {
              adapter: adapter.id
            }
          });
        }
      }
    }
    return {
      ok: diagnostics.every((d) => d.severity !== "error"),
      diagnostics,
      filesScanned: files.length
    };
  }
};

// src/cli/use-cases.ts
import fs14 from "fs";
import path15 from "path";

// src/core/autofix.ts
import fs6 from "fs";
function applyToFile(file, action) {
  const raw = fs6.readFileSync(file, "utf8");
  const parsed = parseMarkdownContent(raw);
  let body = parsed.body || "";
  const frontmatter = parsed.frontmatter || {};
  if (action.type === "add_frontmatter_field") {
    const key = String(action.payload.key || "");
    if (!key || Object.hasOwn(frontmatter, key)) {
      return false;
    }
    frontmatter[key] = action.payload.value;
  }
  if (action.type === "add_section") {
    const section = String(action.payload.section || "");
    if (!section || body.includes(`## ${section}`)) {
      return false;
    }
    body = `${body.trimEnd()}

## ${section}

`;
  }
  if (action.type === "remove_template_hint") {
    const hint = String(action.payload.hint || "");
    if (!hint || !body.includes(hint)) {
      return false;
    }
    body = body.replaceAll(hint, "");
  }
  fs6.writeFileSync(file, serializeMarkdown(frontmatter, body));
  return true;
}
function applyAutofixes(actions) {
  let applied = 0;
  const diagnostics = [];
  for (const action of actions) {
    if (!action.safe) {
      continue;
    }
    const ok = applyToFile(action.file, action);
    if (ok) {
      applied += 1;
    }
  }
  return {
    applied,
    diagnostics
  };
}

// src/adapters/cross-reference-adapter.ts
import fs7 from "fs";
import path7 from "path";
function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === "string");
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}
var CrossReferenceAdapter = class {
  id = "cross-reference";
  supports(_filePath, context) {
    return Boolean(context.ruleSet.crossReferences);
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const cross = context.ruleSet.crossReferences;
    if (!cross) {
      return diagnostics;
    }
    let parsed;
    try {
      parsed = parseMarkdown(filePath);
    } catch (error) {
      return [
        {
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: "Fix YAML syntax first, then re-run validate."
          }
        }
      ];
    }
    const base = path7.dirname(filePath);
    for (const field of cross.fields) {
      const refs = asStringArray(parsed.frontmatter[field]);
      for (const ref of refs) {
        if (!cross.allowAbsolute && path7.isAbsolute(ref)) {
          diagnostics.push({
            code: "invalid_reference_absolute",
            message: `Absolute path not allowed in ${field}: ${ref}`,
            severity: "error",
            file: filePath
          });
          continue;
        }
        const resolved = path7.resolve(base, ref);
        if (!fs7.existsSync(resolved)) {
          diagnostics.push({
            code: "broken_reference",
            message: `Broken reference in ${field}: ${ref}`,
            severity: "error",
            file: filePath,
            details: { resolved }
          });
          continue;
        }
        if (cross.allowedExtensions && cross.allowedExtensions.length > 0) {
          const ext = path7.extname(resolved);
          if (!cross.allowedExtensions.includes(ext)) {
            diagnostics.push({
              code: "reference_extension_not_allowed",
              message: `Reference extension not allowed in ${field}: ${ref}`,
              severity: "error",
              file: filePath
            });
          }
        }
      }
    }
    return diagnostics;
  }
};

// src/adapters/content-policy-adapter.ts
import fs8 from "fs";
var ContentPolicyAdapter = class {
  id = "content-policy";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some(
      (rule) => Array.isArray(rule.forbidContentPatterns) && rule.forbidContentPatterns.length > 0
    );
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const raw = fs8.readFileSync(filePath, "utf8");
    for (const rule of context.ruleSet.fileRules) {
      for (const pattern of rule.forbidContentPatterns || []) {
        let regex = null;
        try {
          regex = new RegExp(pattern, "m");
        } catch (error) {
          diagnostics.push({
            code: "invalid_forbid_content_pattern",
            message: `Invalid forbidContentPatterns regex '${pattern}': ${error.message}`,
            severity: "warning",
            file: filePath,
            ruleId: rule.id
          });
        }
        if (!regex) {
          continue;
        }
        if (regex.test(raw)) {
          diagnostics.push({
            code: "forbidden_content_pattern",
            message: `Forbidden content pattern matched: ${pattern}`,
            severity: "error",
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: "Remove or redact this content, or intentionally relax the rule in repotype.yaml if this is expected."
            }
          });
        }
      }
    }
    return diagnostics;
  }
};

// src/adapters/file-schema-adapter.ts
import fs9 from "fs";
import path8 from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml3 from "js-yaml";
var ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
function loadSchema(repoRoot, schemaRef) {
  const schemaPath = path8.resolve(repoRoot, schemaRef);
  const schemaRaw = fs9.readFileSync(schemaPath, "utf8");
  return JSON.parse(schemaRaw);
}
var FileSchemaAdapter = class {
  id = "file-schema";
  supports(_filePath, context) {
    const kind = context.ruleSet.schema?.kind;
    return kind === "json" || kind === "yaml";
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const binding = context.ruleSet.schema;
    if (!binding || binding.kind !== "json" && binding.kind !== "yaml") {
      return diagnostics;
    }
    const schemaRef = binding.schema;
    const schemaPath = path8.resolve(context.repoRoot, schemaRef);
    if (!fs9.existsSync(schemaPath)) {
      return [
        {
          code: "schema_not_found",
          message: `Schema file not found: ${schemaRef}`,
          severity: "error",
          file: filePath
        }
      ];
    }
    let schema;
    try {
      schema = loadSchema(context.repoRoot, schemaRef);
    } catch (error) {
      return [
        {
          code: "invalid_schema_json",
          message: `Schema file is not valid JSON: ${schemaRef} (${error.message})`,
          severity: "error",
          file: filePath
        }
      ];
    }
    const raw = fs9.readFileSync(filePath, "utf8");
    let payload;
    try {
      if (binding.kind === "json") {
        payload = JSON.parse(raw);
      } else {
        payload = yaml3.load(raw);
      }
    } catch (error) {
      return [
        {
          code: binding.kind === "json" ? "invalid_json_syntax" : "invalid_yaml_syntax",
          message: `Invalid ${binding.kind.toUpperCase()} syntax: ${error.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: `Fix ${binding.kind.toUpperCase()} syntax, then re-run validation.`
          }
        }
      ];
    }
    const validate = ajv.compile(schema);
    const ok = validate(payload);
    if (ok) {
      return diagnostics;
    }
    for (const err of validate.errors || []) {
      diagnostics.push({
        code: "file_schema_violation",
        message: `${err.instancePath || "/"} ${err.message || "invalid"}`,
        severity: "error",
        file: filePath,
        details: {
          kind: binding.kind
        }
      });
    }
    return diagnostics;
  }
};

// src/adapters/filename-adapter.ts
import path9 from "path";
var FilenameAdapter = class {
  id = "filename";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some((rule) => Boolean(rule.filenamePattern));
  }
  async validate(filePath, context) {
    const name = path9.basename(filePath);
    const diagnostics = [];
    for (const rule of context.ruleSet.fileRules) {
      if (!rule.filenamePattern) {
        continue;
      }
      const regex = new RegExp(rule.filenamePattern);
      if (!regex.test(name)) {
        diagnostics.push({
          code: "filename_pattern_mismatch",
          message: `Filename '${name}' does not match pattern ${rule.filenamePattern}`,
          severity: "error",
          file: filePath,
          ruleId: rule.id
        });
      }
    }
    return diagnostics;
  }
};

// src/adapters/folder-structure-adapter.ts
import fs10 from "fs";
import path10 from "path";
import { globSync as globSync3 } from "glob";
function hasGlobChars(value) {
  return /[*?[\]{}()!+@]/.test(value);
}
function matchesAny(name, patterns) {
  return patterns.some((pattern) => matchesGlob(name, pattern));
}
function collectTargetDirectories(rule, repoRoot) {
  if (rule.path) {
    return [path10.resolve(repoRoot, rule.path)];
  }
  if (rule.glob) {
    const matched = globSync3(rule.glob, {
      cwd: repoRoot,
      absolute: true,
      nodir: false,
      dot: true,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"]
    });
    return matched.filter((entry) => fs10.existsSync(entry) && fs10.statSync(entry).isDirectory());
  }
  return [];
}
function checkRequiredFolders(dirPath, rule, childFolders, diagnostics) {
  for (const required of rule.requiredFolders || []) {
    if (hasGlobChars(required)) {
      if (!childFolders.some((child) => matchesGlob(child, required))) {
        diagnostics.push({
          code: "required_folder_missing",
          message: `Missing required child folder pattern '${required}' under '${dirPath}'`,
          severity: "error",
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: "Create the expected folder or update requiredFolders in repotype.yaml."
          }
        });
      }
      continue;
    }
    if (!childFolders.includes(required)) {
      diagnostics.push({
        code: "required_folder_missing",
        message: `Missing required child folder '${required}' under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: "Create the folder or update requiredFolders in repotype.yaml."
        }
      });
    }
  }
}
function checkRequiredFiles(dirPath, rule, childFiles, diagnostics) {
  for (const required of rule.requiredFiles || []) {
    if (hasGlobChars(required)) {
      if (!childFiles.some((child) => matchesGlob(child, required))) {
        diagnostics.push({
          code: "required_file_missing",
          message: `Missing required file pattern '${required}' under '${dirPath}'`,
          severity: "error",
          file: dirPath,
          ruleId: rule.id,
          details: {
            hint: "Add the required file or update requiredFiles in repotype.yaml."
          }
        });
      }
      continue;
    }
    if (!childFiles.includes(required)) {
      diagnostics.push({
        code: "required_file_missing",
        message: `Missing required file '${required}' under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          hint: "Add the file or update requiredFiles in repotype.yaml."
        }
      });
    }
  }
}
function checkAllowedFolders(dirPath, rule, childFolders, diagnostics) {
  if (!rule.allowedFolders || rule.allowedFolders.length === 0) {
    return;
  }
  for (const child of childFolders) {
    if (!matchesAny(child, rule.allowedFolders)) {
      diagnostics.push({
        code: "disallowed_child_folder",
        message: `Child folder '${child}' is not allowed under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFolders: rule.allowedFolders,
          hint: "Move/remove this folder or expand allowedFolders in repotype.yaml."
        }
      });
    }
  }
}
function checkAllowedFiles(dirPath, rule, childFiles, diagnostics) {
  if (!rule.allowedFiles || rule.allowedFiles.length === 0) {
    return;
  }
  for (const child of childFiles) {
    if (!matchesAny(child, rule.allowedFiles)) {
      diagnostics.push({
        code: "disallowed_child_file",
        message: `Child file '${child}' is not allowed under '${dirPath}'`,
        severity: "error",
        file: dirPath,
        ruleId: rule.id,
        details: {
          allowedFiles: rule.allowedFiles,
          hint: "Move/remove this file or expand allowedFiles in repotype.yaml."
        }
      });
    }
  }
}
var FolderStructureAdapter = class {
  id = "folder-structure";
  evaluated = false;
  supports(_filePath, context) {
    return (context.config.folders || []).length > 0;
  }
  async validate(_filePath, context) {
    if (this.evaluated) {
      return [];
    }
    this.evaluated = true;
    const diagnostics = [];
    const folderRules = context.config.folders || [];
    for (const rule of folderRules) {
      const targets = collectTargetDirectories(rule, context.repoRoot);
      if (rule.path && targets.length === 1 && !fs10.existsSync(targets[0])) {
        diagnostics.push({
          code: "folder_rule_path_missing",
          message: `Folder rule target path does not exist: ${rule.path}`,
          severity: "error",
          file: path10.resolve(context.repoRoot, rule.path),
          ruleId: rule.id,
          details: {
            hint: "Create this folder or update the folder rule path in repotype.yaml."
          }
        });
        continue;
      }
      if (targets.length === 0) {
        diagnostics.push({
          code: "folder_rule_no_targets",
          message: `Folder rule '${rule.id || rule.path || rule.glob}' matched no directories`,
          severity: "suggestion",
          file: context.configPath,
          ruleId: rule.id,
          details: {
            hint: "Adjust path/glob so the rule applies to actual directories."
          }
        });
        continue;
      }
      for (const targetDir of targets) {
        if (!fs10.existsSync(targetDir) || !fs10.statSync(targetDir).isDirectory()) {
          continue;
        }
        const entries = fs10.readdirSync(targetDir, { withFileTypes: true });
        const childFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
        const childFiles = entries.filter((e) => e.isFile()).map((e) => e.name);
        checkRequiredFolders(targetDir, rule, childFolders, diagnostics);
        checkRequiredFiles(targetDir, rule, childFiles, diagnostics);
        checkAllowedFolders(targetDir, rule, childFolders, diagnostics);
        checkAllowedFiles(targetDir, rule, childFiles, diagnostics);
      }
    }
    return diagnostics;
  }
};

// src/adapters/frontmatter-schema-adapter.ts
import fs11 from "fs";
import path11 from "path";
import Ajv2 from "ajv";
import addFormats2 from "ajv-formats";
var ajv2 = new Ajv2({ allErrors: true, strict: false });
addFormats2(ajv2);
var FrontmatterSchemaAdapter = class {
  id = "frontmatter-schema";
  supports(filePath, context) {
    return filePath.endsWith(".md") && Boolean(context.ruleSet.schema?.kind === "frontmatter");
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const schemaRef = context.ruleSet.schema?.schema;
    if (!schemaRef) {
      return diagnostics;
    }
    const schemaPath = path11.resolve(context.repoRoot, schemaRef);
    if (!fs11.existsSync(schemaPath)) {
      return [
        {
          code: "schema_not_found",
          message: `Schema file not found: ${schemaRef}`,
          severity: "error",
          file: filePath
        }
      ];
    }
    const schemaRaw = fs11.readFileSync(schemaPath, "utf8");
    const schema = JSON.parse(schemaRaw);
    const validate = ajv2.compile(schema);
    let parsed;
    try {
      parsed = parseMarkdown(filePath);
    } catch (error) {
      return [
        {
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: "Fix YAML syntax first, then re-run validate."
          }
        }
      ];
    }
    const ok = validate(parsed.frontmatter);
    if (ok) {
      return diagnostics;
    }
    for (const err of validate.errors || []) {
      diagnostics.push({
        code: "frontmatter_schema_violation",
        message: `${err.instancePath || "/"} ${err.message || "invalid"}`,
        severity: "error",
        file: filePath
      });
    }
    return diagnostics;
  }
};

// src/adapters/guidance-adapter.ts
import path12 from "path";
import fs12 from "fs";
import { minimatch as minimatch2 } from "minimatch";
function isInManagedFolderScope(relativePath, context) {
  const folders = context.config.folders || [];
  if (folders.length === 0) {
    return true;
  }
  return folders.some((folder) => {
    if (folder.path) {
      return relativePath === folder.path || relativePath.startsWith(`${folder.path}/`);
    }
    if (folder.glob) {
      return minimatch2(relativePath, folder.glob, { dot: true });
    }
    return false;
  });
}
function isTemplateSource(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  return normalized.includes("/templates/") || normalized.endsWith(".template.md");
}
var GuidanceAdapter = class {
  id = "guidance";
  supports(filePath, _context) {
    return filePath.endsWith(".md");
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const relative = context.ruleSet.filePath;
    if (context.ruleSet.fileRules.length === 0) {
      if (!isInManagedFolderScope(relative, context)) {
        return diagnostics;
      }
      diagnostics.push({
        code: "no_matching_file_rule",
        message: `No file rule matched '${relative}'. Add a files rule in repotype.yaml to enforce expectations.`,
        severity: "suggestion",
        file: filePath,
        details: {
          example: `files:
  - id: ${path12.basename(relative, ".md") || "rule-id"}
    glob: "${relative}"`
        }
      });
      return diagnostics;
    }
    const body = fs12.readFileSync(filePath, "utf8");
    const hasFrontmatter = body.startsWith("---\n");
    if (!context.ruleSet.schema && hasFrontmatter && !isTemplateSource(relative)) {
      diagnostics.push({
        code: "missing_schema_binding",
        message: `Matched rule(s) for '${relative}' but no frontmatter schema is bound. Generate one with: repotype generate schema "${path12.dirname(filePath)}" "schemas/${path12.basename(path12.dirname(filePath))}.frontmatter.schema.json"`,
        severity: "suggestion",
        file: filePath
      });
    }
    if (context.ruleSet.requiredSections.length === 0) {
      diagnostics.push({
        code: "missing_required_sections_rule",
        message: `Matched rule(s) for '${relative}' but requiredSections is empty. Add requiredSections to enforce expected markdown structure.`,
        severity: "suggestion",
        file: filePath
      });
    }
    return diagnostics;
  }
};

// src/adapters/markdown-template-adapter.ts
import fs13 from "fs";
import path13 from "path";
function stripFencedCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, "");
}
function stripInlineCode(content) {
  return content.replace(/`[^`]*`/g, "");
}
function loadTemplateRequiredFields(templatePath) {
  if (!fs13.existsSync(templatePath)) {
    return [];
  }
  const raw = fs13.readFileSync(templatePath, "utf8");
  const parsed = parseMarkdownContent(raw);
  return Object.keys(parsed.frontmatter || {}).filter((key) => !key.startsWith("_"));
}
function loadTemplateSections(templatePath) {
  if (!fs13.existsSync(templatePath)) {
    return [];
  }
  const raw = fs13.readFileSync(templatePath, "utf8");
  const parsed = parseMarkdownContent(raw);
  return extractSections(parsed.body || "");
}
var MarkdownTemplateAdapter = class {
  id = "markdown-template";
  supports(filePath, _context) {
    return filePath.endsWith(".md");
  }
  async validate(filePath, context) {
    const diagnostics = [];
    let parsed;
    try {
      parsed = parseMarkdown(filePath);
    } catch (error) {
      return [
        {
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error.message}`,
          severity: "error",
          file: filePath,
          details: {
            hint: "Fix YAML syntax first, then re-run validate."
          }
        }
      ];
    }
    const fileSections = extractSections(parsed.body);
    for (const section of context.ruleSet.requiredSections) {
      if (!fileSections.includes(section)) {
        diagnostics.push({
          code: "missing_section",
          message: `Missing required section: ## ${section}`,
          severity: "error",
          file: filePath,
          autofix: {
            type: "add_section",
            safe: true,
            file: filePath,
            payload: { section }
          }
        });
      }
    }
    const templateId = context.ruleSet.template?.id;
    if (templateId) {
      const template = (context.config.templates || []).find((t) => t.id === templateId);
      if (template) {
        const templatePath = path13.resolve(context.repoRoot, template.path);
        const requiredFields = loadTemplateRequiredFields(templatePath);
        const requiredTemplateSections = loadTemplateSections(templatePath);
        for (const field of requiredFields) {
          if (!Object.hasOwn(parsed.frontmatter, field)) {
            diagnostics.push({
              code: "missing_frontmatter_field",
              message: `Missing frontmatter field '${field}' required by template '${templateId}'`,
              severity: "error",
              file: filePath,
              autofix: {
                type: "add_frontmatter_field",
                safe: true,
                file: filePath,
                payload: { key: field, value: "" }
              }
            });
          }
        }
        for (const section of requiredTemplateSections) {
          if (!fileSections.includes(section)) {
            diagnostics.push({
              code: "missing_template_section",
              message: `Missing template section: ## ${section}`,
              severity: "error",
              file: filePath,
              autofix: {
                type: "add_section",
                safe: true,
                file: filePath,
                payload: { section }
              }
            });
          }
        }
      }
    }
    const configuredHints = context.ruleSet.templateHints;
    if (configuredHints.length > 0) {
      const hintTarget = stripInlineCode(stripFencedCodeBlocks(parsed.body));
      for (const hint of configuredHints) {
        if (!hintTarget.includes(hint)) continue;
        diagnostics.push({
          code: "template_hint_present",
          message: `Template hint still present: ${hint}`,
          severity: "warning",
          file: filePath,
          autofix: {
            type: "remove_template_hint",
            safe: true,
            file: filePath,
            payload: { hint }
          }
        });
      }
    }
    return diagnostics;
  }
};

// src/adapters/path-policy-adapter.ts
import path14 from "path";
function normalize2(p) {
  return p.replace(/\\/g, "/");
}
function matchesCase(value, mode) {
  if (mode === "kebab") {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  }
  if (mode === "snake") {
    return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(value);
  }
  if (mode === "camel") {
    return /^[a-z][A-Za-z0-9]*$/.test(value);
  }
  return /^[a-z0-9]+$/.test(value);
}
function segmentsForCase(relativePath) {
  const normalized = normalize2(relativePath);
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0) {
    return [];
  }
  const last = parts[parts.length - 1];
  const ext = path14.extname(last);
  if (ext) {
    parts[parts.length - 1] = last.slice(0, last.length - ext.length);
  }
  return parts.filter((entry) => entry.length > 0);
}
var PathPolicyAdapter = class {
  id = "path-policy";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some((rule) => Boolean(rule.pathPattern || rule.pathCase));
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const relativePath = context.ruleSet.filePath;
    for (const rule of context.ruleSet.fileRules) {
      if (rule.pathPattern) {
        let regex = null;
        try {
          regex = new RegExp(rule.pathPattern);
        } catch (error) {
          diagnostics.push({
            code: "invalid_path_pattern",
            message: `Invalid pathPattern regex '${rule.pathPattern}': ${error.message}`,
            severity: "warning",
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: "Fix this regex in repotype.yaml."
            }
          });
        }
        if (regex && !regex.test(relativePath)) {
          diagnostics.push({
            code: "path_pattern_mismatch",
            message: `Path '${relativePath}' does not match pattern ${rule.pathPattern}`,
            severity: "error",
            file: filePath,
            ruleId: rule.id,
            details: {
              hint: "Rename/move file or adjust pathPattern in repotype.yaml."
            }
          });
        }
      }
      if (rule.pathCase) {
        const segments = segmentsForCase(relativePath);
        for (const segment of segments) {
          if (segment.startsWith(".")) {
            continue;
          }
          if (!matchesCase(segment, rule.pathCase)) {
            diagnostics.push({
              code: "path_case_mismatch",
              message: `Path segment '${segment}' is not ${rule.pathCase}-case in '${relativePath}'`,
              severity: "error",
              file: filePath,
              ruleId: rule.id,
              details: {
                expected: rule.pathCase,
                segment,
                hint: "Rename this file/folder segment or relax pathCase in repotype.yaml."
              }
            });
          }
        }
      }
    }
    return diagnostics;
  }
};

// src/cli/runtime.ts
function createDefaultEngine() {
  return new ValidationEngine([
    new FilenameAdapter(),
    new PathPolicyAdapter(),
    new FolderStructureAdapter(),
    new MarkdownTemplateAdapter(),
    new FrontmatterSchemaAdapter(),
    new FileSchemaAdapter(),
    new CrossReferenceAdapter(),
    new ContentPolicyAdapter(),
    new GuidanceAdapter()
  ]);
}

// src/sdk/report-sdk.ts
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function parseComplianceReportJson(json) {
  return JSON.parse(json);
}
function renderMarkdownComplianceReport(report) {
  const lines = [];
  lines.push("# Repotype Compliance Report");
  lines.push("");
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Target: ${report.target}`);
  lines.push(`- Repo root: ${report.repoRoot}`);
  lines.push(`- Config: ${report.configPath}`);
  lines.push(`- Status: ${report.ok ? "PASS" : "FAIL"}`);
  lines.push(`- Files scanned: ${report.filesScanned}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Severity | Count |");
  lines.push("| --- | ---: |");
  lines.push(`| error | ${report.totals.errors} |`);
  lines.push(`| warning | ${report.totals.warnings} |`);
  lines.push(`| suggestion | ${report.totals.suggestions} |`);
  lines.push(`| total diagnostics | ${report.totals.diagnostics} |`);
  lines.push("");
  lines.push("## Diagnostics By Code");
  lines.push("");
  lines.push("| Code | Severity | Count |");
  lines.push("| --- | --- | ---: |");
  for (const code of report.byCode) {
    lines.push(`| ${code.code} | ${code.severity} | ${code.count} |`);
  }
  lines.push("");
  lines.push("## Sample Findings");
  lines.push("");
  if (report.sampleFindings.length === 0) {
    lines.push("- No findings.");
  } else {
    for (const finding of report.sampleFindings) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.message} (${finding.file})`);
    }
  }
  lines.push("");
  return lines.join("\n");
}
function renderHtmlComplianceReport(report) {
  const byCodeRows = report.byCode.map(
    (item) => `<tr><td><code>${escapeHtml(item.code)}</code></td><td>${escapeHtml(item.severity)}</td><td class="num">${item.count}</td></tr>`
  ).join("\n");
  const sampleRows = report.sampleFindings.length === 0 ? '<tr><td colspan="4">No findings.</td></tr>' : report.sampleFindings.map(
    (item) => `<tr><td>${escapeHtml(item.severity)}</td><td><code>${escapeHtml(item.code)}</code></td><td>${escapeHtml(item.message)}</td><td><code>${escapeHtml(item.file)}</code></td></tr>`
  ).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Repotype Compliance Report</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; line-height: 1.5; }
    h1, h2 { margin: 0 0 12px; }
    section { margin: 24px 0; }
    .meta { margin: 0; padding-left: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #9ca3af; padding: 8px; text-align: left; vertical-align: top; }
    .num { text-align: right; }
    .badge { display: inline-block; border: 1px solid #9ca3af; border-radius: 999px; padding: 2px 10px; font-weight: 600; }
    code { white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <h1>Repotype Compliance Report</h1>
  <p><span class="badge">Status: ${report.ok ? "PASS" : "FAIL"}</span></p>

  <section>
    <h2>Metadata</h2>
    <ul class="meta">
      <li>Generated: <code>${escapeHtml(report.generatedAt)}</code></li>
      <li>Target: <code>${escapeHtml(report.target)}</code></li>
      <li>Repo root: <code>${escapeHtml(report.repoRoot)}</code></li>
      <li>Config: <code>${escapeHtml(report.configPath)}</code></li>
      <li>Files scanned: <code>${report.filesScanned}</code></li>
    </ul>
  </section>

  <section>
    <h2>Summary</h2>
    <table>
      <thead><tr><th>Severity</th><th>Count</th></tr></thead>
      <tbody>
        <tr><td>error</td><td class="num">${report.totals.errors}</td></tr>
        <tr><td>warning</td><td class="num">${report.totals.warnings}</td></tr>
        <tr><td>suggestion</td><td class="num">${report.totals.suggestions}</td></tr>
        <tr><td>total diagnostics</td><td class="num">${report.totals.diagnostics}</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Diagnostics By Code</h2>
    <table>
      <thead><tr><th>Code</th><th>Severity</th><th>Count</th></tr></thead>
      <tbody>
        ${byCodeRows}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Sample Findings</h2>
    <table>
      <thead><tr><th>Severity</th><th>Code</th><th>Message</th><th>File</th></tr></thead>
      <tbody>
        ${sampleRows}
      </tbody>
    </table>
  </section>

  <script type="application/json" id="repotype-report-data">${escapeHtml(JSON.stringify(report))}</script>
</body>
</html>
`;
}
function renderComplianceReport(report, format = "markdown") {
  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }
  if (format === "html") {
    return renderHtmlComplianceReport(report);
  }
  return renderMarkdownComplianceReport(report);
}
function renderComplianceReportFromJson(json, format = "html") {
  return renderComplianceReport(parseComplianceReportJson(json), format);
}

// src/cli/use-cases.ts
import yaml4 from "js-yaml";
function deriveTargetRoot(targetPath) {
  if (fs14.existsSync(targetPath) && fs14.statSync(targetPath).isDirectory()) {
    return targetPath;
  }
  return path15.dirname(targetPath);
}
async function validatePath(target, configOverridePath) {
  const absolute = path15.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path15.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path15.dirname(configPath);
  const config = loadConfig(configPath);
  const engine = createDefaultEngine();
  const result = await engine.validate(target, { configPath });
  const pluginDiagnostics = runPluginPhase(config, repoRoot, "validate");
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];
  return {
    ...result,
    diagnostics,
    ok: diagnostics.every((d) => d.severity !== "error")
  };
}
function explainPath(target, configOverridePath) {
  const absolute = path15.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path15.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path15.dirname(configPath);
  const config = loadConfig(configPath);
  return explainRules(config, repoRoot, absolute);
}
async function fixPath(target, configOverridePath) {
  const absolute = path15.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path15.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path15.dirname(configPath);
  const config = loadConfig(configPath);
  const result = await validatePath(target, configPath);
  const actions = result.diagnostics.map((d) => d.autofix).filter((action) => Boolean(action));
  const fixResult = applyAutofixes(actions);
  const pluginDiagnostics = runPluginPhase(config, repoRoot, "fix");
  const validation = {
    ...result,
    diagnostics: [...result.diagnostics, ...pluginDiagnostics]
  };
  validation.ok = validation.diagnostics.every((d) => d.severity !== "error");
  return {
    validation,
    fix: fixResult
  };
}
function scaffoldFromTemplate(templateId, outputPath, variables) {
  const absolute = path15.resolve(outputPath);
  const configPath = findConfig(absolute);
  const repoRoot = path15.dirname(configPath);
  const config = loadConfig(configPath);
  const content = renderTemplate(config, repoRoot, templateId, variables);
  const parent = path15.dirname(absolute);
  if (!fs14.existsSync(parent)) {
    fs14.mkdirSync(parent, { recursive: true });
  }
  fs14.writeFileSync(absolute, content);
  return absolute;
}
function generateSchemaFromContent(target, output, pattern = "**/*.md") {
  return generateFrontmatterSchemaFromContent(target, output, pattern);
}
function initRepotypeConfig(targetDir, options = {}) {
  const type = options.type ?? "default";
  const force = options.force ?? false;
  const absoluteTarget = path15.resolve(targetDir);
  const outputPath = path15.join(absoluteTarget, "repotype.yaml");
  if (fs14.existsSync(outputPath) && !force) {
    throw new Error(`repotype.yaml already exists at ${outputPath}. Use --force to overwrite.`);
  }
  const config = options.from ? yaml4.load(fs14.readFileSync(path15.resolve(options.from), "utf8")) : createPresetConfig(type);
  if (!config || typeof config !== "object" || !config.version) {
    throw new Error('Source config is invalid. Expected YAML with top-level "version".');
  }
  const rendered = yaml4.dump(config, { lineWidth: 120 });
  fs14.mkdirSync(absoluteTarget, { recursive: true });
  fs14.writeFileSync(outputPath, rendered);
  return {
    outputPath,
    source: options.from ? `file:${path15.resolve(options.from)}` : `preset:${type}`
  };
}
function getRepotypePresetMetadata() {
  return {
    types: listPresetTypes()
  };
}
function installPluginRequirements(target) {
  const absolute = path15.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path15.dirname(configPath);
  const config = loadConfig(configPath);
  const installs = installPlugins(config, repoRoot);
  return {
    repoRoot,
    configPath,
    installs,
    ok: installs.every((entry) => entry.ok)
  };
}
function pluginStatus(target) {
  const absolute = path15.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path15.dirname(configPath);
  const config = loadConfig(configPath);
  const plugins = describePlugins(config);
  return {
    repoRoot,
    configPath,
    plugins
  };
}
async function generateComplianceReport(target, format = "markdown", configOverridePath) {
  const absolute = path15.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path15.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path15.dirname(configPath);
  const result = await validatePath(target, configPath);
  const totals = result.diagnostics.reduce(
    (acc, diagnostic) => {
      if (diagnostic.severity === "error") acc.errors += 1;
      if (diagnostic.severity === "warning") acc.warnings += 1;
      if (diagnostic.severity === "suggestion") acc.suggestions += 1;
      acc.diagnostics += 1;
      return acc;
    },
    { errors: 0, warnings: 0, suggestions: 0, diagnostics: 0 }
  );
  const byCodeMap = /* @__PURE__ */ new Map();
  for (const diagnostic of result.diagnostics) {
    const entry = byCodeMap.get(diagnostic.code);
    if (entry) {
      entry.count += 1;
      continue;
    }
    byCodeMap.set(diagnostic.code, {
      severity: diagnostic.severity,
      count: 1
    });
  }
  const severityRank = {
    error: 0,
    warning: 1,
    suggestion: 2
  };
  const byCode = [...byCodeMap.entries()].map(([code, value]) => ({ code, severity: value.severity, count: value.count })).sort((a, b) => {
    const severityDiff = severityRank[a.severity] - severityRank[b.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }
    return b.count - a.count;
  });
  const sampleFindings = result.diagnostics.slice(0, 50).map((diagnostic) => ({
    code: diagnostic.code,
    severity: diagnostic.severity,
    file: diagnostic.file,
    message: diagnostic.message
  }));
  const report = {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    target: absolute,
    repoRoot,
    configPath,
    ok: result.ok,
    filesScanned: result.filesScanned,
    totals,
    byCode,
    sampleFindings
  };
  return {
    ok: result.ok,
    report,
    rendered: renderComplianceReport(report, format)
  };
}

// src/cli/operations.ts
import fs17 from "fs";
import path18 from "path";

// src/cli/git-hooks.ts
import fs15 from "fs";
import path16 from "path";
var START_MARKER = "# >>> repotype-checks >>>";
var END_MARKER = "# <<< repotype-checks <<<";
var MARKER_REGEX = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}\\n?`, "m");
function findGitRoot(startPath) {
  let dir = path16.resolve(startPath);
  if (fs15.existsSync(dir) && fs15.statSync(dir).isFile()) {
    dir = path16.dirname(dir);
  }
  while (true) {
    const gitPath = path16.join(dir, ".git");
    if (fs15.existsSync(gitPath)) {
      return dir;
    }
    const parent = path16.dirname(dir);
    if (parent === dir) {
      throw new Error("No .git directory found in current or parent directories");
    }
    dir = parent;
  }
}
function makeHookSnippet(repoRoot) {
  return `${START_MARKER}
REPO_ROOT="${repoRoot}"
if command -v repotype >/dev/null 2>&1; then
  repotype validate "$REPO_ROOT"
elif command -v pnpm >/dev/null 2>&1; then
  pnpm --silent exec repotype validate "$REPO_ROOT"
else
  echo "repotype CLI not found. Install @supernal/repotype or add it to PATH."
  exit 1
fi
${END_MARKER}
`;
}
function upsertHook(hookFile, snippet) {
  const shebang = "#!/usr/bin/env bash\nset -euo pipefail\n\n";
  if (!fs15.existsSync(hookFile)) {
    fs15.writeFileSync(hookFile, `${shebang}${snippet}`);
    fs15.chmodSync(hookFile, 493);
    return "created";
  }
  let current = fs15.readFileSync(hookFile, "utf8");
  if (!current.startsWith("#!")) {
    current = `${shebang}${current}`;
  }
  if (MARKER_REGEX.test(current)) {
    const next = current.replace(MARKER_REGEX, snippet);
    if (next === current) {
      fs15.chmodSync(hookFile, 493);
      return "unchanged";
    }
    fs15.writeFileSync(hookFile, next);
    fs15.chmodSync(hookFile, 493);
    return "updated";
  }
  const separator = current.endsWith("\n") ? "\n" : "\n\n";
  fs15.writeFileSync(hookFile, `${current}${separator}${snippet}`);
  fs15.chmodSync(hookFile, 493);
  return "updated";
}
function installChecks(options) {
  const repoRoot = findGitRoot(options.target);
  const hooksDir = path16.join(repoRoot, ".git", "hooks");
  if (!fs15.existsSync(hooksDir)) {
    throw new Error(`Git hooks directory not found: ${hooksDir}`);
  }
  const hookNames = options.hook === "both" ? ["pre-commit", "pre-push"] : [options.hook];
  const snippet = makeHookSnippet(repoRoot);
  const hooks = hookNames.map((hook) => {
    const hookPath = path16.join(hooksDir, hook);
    const status = upsertHook(hookPath, snippet);
    return { hook, status, path: hookPath };
  });
  return { repoRoot, hooks };
}
function inspectChecks(target) {
  const repoRoot = findGitRoot(target);
  const hooksDir = path16.join(repoRoot, ".git", "hooks");
  const hookNames = ["pre-commit", "pre-push"];
  const hooks = hookNames.map((hook) => {
    const hookPath = path16.join(hooksDir, hook);
    if (!fs15.existsSync(hookPath)) {
      return { hook, path: hookPath, exists: false, managed: false };
    }
    const content = fs15.readFileSync(hookPath, "utf8");
    return {
      hook,
      path: hookPath,
      exists: true,
      managed: MARKER_REGEX.test(content)
    };
  });
  return { repoRoot, hooks };
}
function uninstallChecks(options) {
  const repoRoot = findGitRoot(options.target);
  const hooksDir = path16.join(repoRoot, ".git", "hooks");
  const hookNames = options.hook === "both" ? ["pre-commit", "pre-push"] : [options.hook];
  const hooks = hookNames.map((hook) => {
    const hookPath = path16.join(hooksDir, hook);
    if (!fs15.existsSync(hookPath)) {
      return { hook, status: "not_found", path: hookPath };
    }
    const current = fs15.readFileSync(hookPath, "utf8");
    if (!MARKER_REGEX.test(current)) {
      return { hook, status: "unchanged", path: hookPath };
    }
    const next = current.replace(MARKER_REGEX, "").trimEnd();
    fs15.writeFileSync(hookPath, next.length > 0 ? `${next}
` : "");
    fs15.chmodSync(hookPath, 493);
    return { hook, status: "removed", path: hookPath };
  });
  return { repoRoot, hooks };
}

// src/cli/watcher.ts
import fs16 from "fs";
import path17 from "path";
import { spawnSync } from "child_process";
function shQuote(input) {
  return `'${input.replace(/'/g, `'"'"'`)}'`;
}
function readCrontab() {
  const read = spawnSync("crontab", ["-l"], { encoding: "utf8" });
  if (read.status !== 0) {
    return "";
  }
  return read.stdout || "";
}
function writeCrontab(content) {
  const write = spawnSync("crontab", ["-"], { input: content, encoding: "utf8" });
  if (write.status !== 0) {
    throw new Error(write.stderr || "Failed to write crontab");
  }
}
function installWatcher(options) {
  const target = path17.resolve(options.target);
  const queueDir = path17.resolve(options.queueDir);
  const logFile = path17.resolve(options.logFile);
  fs16.mkdirSync(path17.dirname(logFile), { recursive: true });
  fs16.mkdirSync(queueDir, { recursive: true });
  const marker = `# REPOTYPE_WATCHER:${target}`;
  const command = [
    `cd ${shQuote(target)}`,
    `&& repotype cleanup-run ${shQuote(target)}`,
    `--queue ${shQuote(queueDir)}`,
    `--min-errors ${options.minErrors}`,
    `>> ${shQuote(logFile)} 2>&1`
  ].join(" ");
  const line = `${options.schedule} ${command} ${marker}`;
  const current = readCrontab();
  const lines = current.split("\n").map((entry) => entry.trimEnd()).filter((entry) => entry.length > 0);
  const filtered = lines.filter((entry) => !entry.includes(marker));
  const changed = filtered.length !== lines.length || !lines.includes(line);
  const nextLines = [...filtered, line];
  const next = `${nextLines.join("\n")}
`;
  if (!options.dryRun && changed) {
    writeCrontab(next);
  }
  return {
    marker,
    schedule: options.schedule,
    command,
    line,
    changed
  };
}
function inspectWatcher(target) {
  const resolved = path17.resolve(target);
  const marker = `# REPOTYPE_WATCHER:${resolved}`;
  const current = readCrontab();
  const lines = current.split("\n").map((entry) => entry.trimEnd()).filter((entry) => entry.length > 0);
  const line = lines.find((entry) => entry.includes(marker));
  return {
    marker,
    installed: Boolean(line),
    line
  };
}
function uninstallWatcher(target, dryRun = false) {
  const resolved = path17.resolve(target);
  const marker = `# REPOTYPE_WATCHER:${resolved}`;
  const current = readCrontab();
  const lines = current.split("\n").map((entry) => entry.trimEnd()).filter((entry) => entry.length > 0);
  const filtered = lines.filter((entry) => !entry.includes(marker));
  const changed = filtered.length !== lines.length;
  if (changed && !dryRun) {
    const next = filtered.length > 0 ? `${filtered.join("\n")}
` : "";
    writeCrontab(next);
  }
  return {
    marker,
    removed: changed,
    changed
  };
}

// src/cli/operations.ts
function resolveRepoRoot(target) {
  const absolute = path18.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path18.dirname(configPath);
  return { repoRoot, configPath };
}
function normalizeOperations(target) {
  const { repoRoot, configPath } = resolveRepoRoot(target);
  const config = loadConfig(configPath);
  const normalized = {
    hooks: {
      enabled: config.operations?.hooks?.enabled ?? false,
      hook: config.operations?.hooks?.hook ?? "both"
    },
    watcher: {
      enabled: config.operations?.watcher?.enabled ?? false,
      schedule: config.operations?.watcher?.schedule ?? "*/15 * * * *",
      queueDir: path18.resolve(repoRoot, config.operations?.watcher?.queueDir ?? "sort_queue"),
      minErrors: config.operations?.watcher?.minErrors ?? 3,
      logFile: path18.resolve(repoRoot, config.operations?.watcher?.logFile ?? ".repotype/logs/watcher.log")
    }
  };
  return {
    repoRoot,
    configPath,
    config: normalized
  };
}
function readLastCleanupEntry(queueDir) {
  const logPath = path18.join(queueDir, "cleanup-log.jsonl");
  if (!fs17.existsSync(logPath)) {
    return { found: false };
  }
  const lines = fs17.readFileSync(logPath, "utf8").split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { found: false };
  }
  try {
    return { found: true, entry: JSON.parse(lines[lines.length - 1]) };
  } catch {
    return { found: false };
  }
}
function getOperationsStatus(target) {
  const normalized = normalizeOperations(target);
  const hooks = inspectChecks(normalized.repoRoot);
  const watcher = inspectWatcher(normalized.repoRoot);
  const cleanup = {
    queueDir: normalized.config.watcher.queueDir,
    lastRun: readLastCleanupEntry(normalized.config.watcher.queueDir)
  };
  return {
    repoRoot: normalized.repoRoot,
    configPath: normalized.configPath,
    config: normalized.config,
    hooks,
    watcher,
    cleanup
  };
}
function applyOperationsConfig(target) {
  const normalized = normalizeOperations(target);
  const hooks = normalized.config.hooks.enabled ? installChecks({ target: normalized.repoRoot, hook: normalized.config.hooks.hook }) : uninstallChecks({ target: normalized.repoRoot, hook: normalized.config.hooks.hook });
  const watcher = normalized.config.watcher.enabled ? installWatcher({
    target: normalized.repoRoot,
    schedule: normalized.config.watcher.schedule,
    queueDir: normalized.config.watcher.queueDir,
    minErrors: normalized.config.watcher.minErrors,
    logFile: normalized.config.watcher.logFile,
    dryRun: false
  }) : uninstallWatcher(normalized.repoRoot);
  return {
    repoRoot: normalized.repoRoot,
    configPath: normalized.configPath,
    applied: {
      hooks,
      watcher
    }
  };
}

// src/service/server.ts
import express from "express";
async function startService(options) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "repotype" });
  });
  app.post("/validate", async (req, res) => {
    try {
      const target = typeof req.body?.target === "string" ? req.body.target : options.cwd;
      const engine = createDefaultEngine();
      const result = await engine.validate(target);
      res.status(result.ok ? 200 : 422).json(result);
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.post("/explain", async (req, res) => {
    try {
      const target = typeof req.body?.target === "string" ? req.body.target : options.cwd;
      const output = explainPath(target);
      res.status(200).json(output);
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  await new Promise((resolve) => {
    app.listen(options.port, () => resolve());
  });
}

// src/universal-commands.ts
import { UniversalCommand } from "@supernal/universal-command";
import path20 from "path";

// src/cli/cleanup.ts
import fs18 from "fs";
import path19 from "path";
function ensureDir(dir) {
  if (!fs18.existsSync(dir)) {
    fs18.mkdirSync(dir, { recursive: true });
  }
}
function getTimestamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function dedupe(items) {
  return [...new Set(items)];
}
function safeDestination(baseQueue, targetRoot, sourceFile) {
  const relative = path19.relative(targetRoot, sourceFile);
  const clamped = relative.startsWith("..") ? path19.basename(sourceFile) : relative;
  const destination = path19.join(baseQueue, clamped);
  if (!fs18.existsSync(destination)) {
    return destination;
  }
  const ext = path19.extname(destination);
  const stem = destination.slice(0, destination.length - ext.length);
  return `${stem}.moved-${Date.now()}${ext}`;
}
function writeAuditLogs(queueDir, entries) {
  ensureDir(queueDir);
  const jsonlPath = path19.join(queueDir, "cleanup-log.jsonl");
  const textPath = path19.join(queueDir, "cleanup-log.md");
  for (const entry of entries) {
    fs18.appendFileSync(jsonlPath, `${JSON.stringify(entry)}
`);
    const summary = [
      `- ${entry.timestamp}`,
      `  - source: ${entry.source}`,
      `  - destination: ${entry.destination}`,
      `  - moved: ${entry.moved ? "yes" : "no (dry-run)"}`,
      `  - errors: ${entry.errorCount}`,
      ...entry.diagnostics.map((d) => `  - ${d.code}: ${d.message}`),
      ""
    ].join("\n");
    fs18.appendFileSync(textPath, summary);
  }
}
async function runCleanup(options) {
  const targetRoot = path19.resolve(options.target);
  const queueDir = path19.resolve(options.queueDir);
  ensureDir(queueDir);
  const validation = await validatePath(targetRoot);
  const errorDiagnostics = validation.diagnostics.filter((d) => d.severity === "error");
  const files = dedupe(errorDiagnostics.map((d) => d.file));
  const entries = [];
  let moved = 0;
  for (const file of files) {
    if (!fs18.existsSync(file)) {
      continue;
    }
    const diagnostics = errorDiagnostics.filter((d) => d.file === file);
    if (diagnostics.length < options.minErrors) {
      continue;
    }
    const destination = safeDestination(queueDir, targetRoot, file);
    ensureDir(path19.dirname(destination));
    if (!options.dryRun) {
      fs18.renameSync(file, destination);
      moved += 1;
    }
    entries.push({
      timestamp: getTimestamp(),
      source: file,
      destination,
      errorCount: diagnostics.length,
      diagnostics: diagnostics.map((d) => ({ code: d.code, message: d.message })),
      moved: !options.dryRun
    });
  }
  if (entries.length > 0) {
    writeAuditLogs(queueDir, entries);
  }
  return {
    scanned: validation.filesScanned,
    candidates: entries.length,
    moved,
    entries: entries.map((entry) => ({
      source: entry.source,
      destination: entry.destination,
      errorCount: entry.errorCount,
      moved: entry.moved
    }))
  };
}

// src/universal-commands.ts
function parseSetFlags(values = []) {
  const output = {};
  for (const entry of values) {
    const idx = entry.indexOf("=");
    if (idx <= 0) continue;
    const key = entry.slice(0, idx);
    const value = entry.slice(idx + 1);
    output[key] = value;
  }
  return output;
}
var repotypeValidateCommand = new UniversalCommand({
  name: "repotype validate",
  description: "Validate repository structure and markdown/frontmatter rules against repotype.yaml",
  scope: "project",
  keywords: ["repo", "schema", "lint", "markdown", "frontmatter", "validation"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target file/directory to validate",
        positional: true,
        required: false
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ target = ".", config }) {
    const result = await validatePath(target, config);
    return {
      ok: result.ok,
      filesScanned: result.filesScanned,
      diagnostics: result.diagnostics
    };
  }
});
var repotypeExplainCommand = new UniversalCommand({
  name: "repotype explain",
  description: "Explain which schema rules apply to a specific file",
  scope: "project",
  keywords: ["repo", "schema", "explain", "rules"],
  input: {
    parameters: [
      {
        name: "file",
        type: "string",
        description: "File path to explain",
        positional: true,
        required: true
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ file, config }) {
    const output = explainPath(file, config);
    return {
      reason: output.reason,
      effective: output.effective
    };
  }
});
var repotypeStatusCommand = new UniversalCommand({
  name: "repotype status",
  description: "Show repotype-managed hooks, watcher state, and cleanup log status",
  scope: "project",
  keywords: ["repotype", "status", "hooks", "watcher", "cleanup"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: true,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ target = "." }) {
    return getOperationsStatus(target);
  }
});
var repotypeApplyCommand = new UniversalCommand({
  name: "repotype apply",
  description: "Apply operations config from repotype.yaml (hooks and watcher)",
  scope: "project",
  keywords: ["repotype", "apply", "operations", "hooks", "watcher"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Repository path",
        positional: true,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ target = "." }) {
    return applyOperationsConfig(target);
  }
});
var repotypeReportCommand = new UniversalCommand({
  name: "repotype report",
  description: "Generate compliance evidence report for a target path",
  scope: "project",
  keywords: ["repotype", "report", "evidence", "compliance"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target file/directory to report on",
        positional: true,
        required: false
      },
      {
        name: "format",
        type: "string",
        description: "Report format (markdown|json|html)",
        positional: false,
        required: false
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      }
    ]
  },
  output: {
    type: "json"
  },
  async handler({ target = ".", format = "markdown", config }) {
    return generateComplianceReport(target, format, config);
  }
});
var repotypeFixCommand = new UniversalCommand({
  name: "repotype fix",
  description: "Apply safe autofixes and return remaining diagnostics",
  scope: "project",
  keywords: ["repotype", "fix", "autofix", "validation"],
  input: {
    parameters: [
      {
        name: "target",
        type: "string",
        description: "Target file or directory",
        positional: true,
        required: false
      },
      {
        name: "config",
        type: "string",
        description: "Explicit config path",
        positional: false,
        required: false
      }
    ]
  },
  output: { type: "json" },
  async handler({ target = ".", config }) {
    return fixPath(target, config);
  }
});
var repotypeCleanupRunCommand = new UniversalCommand({
  name: "repotype cleanup-run",
  description: "Move severely invalid files into a triage queue",
  scope: "project",
  keywords: ["repotype", "cleanup", "triage", "sort_queue"],
  input: {
    parameters: [
      { name: "target", type: "string", description: "Target path", positional: true, required: false },
      { name: "queue", type: "string", description: "Queue directory", positional: false, required: false },
      { name: "minErrors", type: "number", description: "Minimum error count before moving", positional: false, required: false },
      { name: "dryRun", type: "boolean", description: "Dry run only", positional: false, required: false }
    ]
  },
  output: { type: "json" },
  async handler({ target = ".", queue = "sort_queue", minErrors = 3, dryRun = false }) {
    const absoluteTarget = path20.resolve(target);
    const queueDir = path20.isAbsolute(queue) ? queue : path20.resolve(absoluteTarget, queue);
    return runCleanup({ target: absoluteTarget, queueDir, minErrors, dryRun });
  }
});
var repotypeInstallChecksCommand = new UniversalCommand({
  name: "repotype install-checks",
  description: "Install repotype git hooks (pre-commit/pre-push)",
  scope: "project",
  keywords: ["repotype", "git", "hooks", "pre-commit", "pre-push"],
  input: {
    parameters: [
      { name: "target", type: "string", description: "Repository path", positional: false, required: false },
      { name: "hook", type: "string", description: "Hook mode: pre-commit|pre-push|both", positional: false, required: false }
    ]
  },
  output: { type: "json" },
  async handler({ target = ".", hook = "both" }) {
    return installChecks({ target, hook });
  }
});
var repotypeInstallWatcherCommand = new UniversalCommand({
  name: "repotype install-watcher",
  description: "Install cron watcher for repotype cleanup automation",
  scope: "project",
  keywords: ["repotype", "watcher", "cron", "cleanup"],
  input: {
    parameters: [
      { name: "target", type: "string", description: "Repository path", positional: false, required: false },
      { name: "schedule", type: "string", description: "Cron schedule", positional: false, required: false },
      { name: "queue", type: "string", description: "Queue directory", positional: false, required: false },
      { name: "minErrors", type: "number", description: "Minimum errors threshold", positional: false, required: false },
      { name: "logFile", type: "string", description: "Watcher log file path", positional: false, required: false },
      { name: "dryRun", type: "boolean", description: "Dry-run installation", positional: false, required: false }
    ]
  },
  output: { type: "json" },
  async handler({
    target = ".",
    schedule = "*/15 * * * *",
    queue = "sort_queue",
    minErrors = 3,
    logFile = ".repotype/logs/watcher.log",
    dryRun = true
  }) {
    const resolvedTarget = path20.resolve(target);
    const queueDir = path20.isAbsolute(queue) ? queue : path20.resolve(resolvedTarget, queue);
    const resolvedLogFile = path20.isAbsolute(logFile) ? logFile : path20.resolve(resolvedTarget, logFile);
    return installWatcher({
      target: resolvedTarget,
      schedule,
      queueDir,
      minErrors,
      logFile: resolvedLogFile,
      dryRun
    });
  }
});
var repotypeScaffoldCommand = new UniversalCommand({
  name: "repotype scaffold",
  description: "Create a file from a configured template",
  scope: "project",
  keywords: ["repotype", "scaffold", "template", "generate"],
  input: {
    parameters: [
      { name: "templateId", type: "string", description: "Template id", positional: true, required: true },
      { name: "output", type: "string", description: "Output path", positional: true, required: true },
      { name: "set", type: "string", description: "Template variable key=value (repeatable)", positional: false, required: false }
    ]
  },
  output: { type: "json" },
  async handler({ templateId, output, set = [] }) {
    const created = scaffoldFromTemplate(templateId, output, parseSetFlags(Array.isArray(set) ? set : [set]));
    return { created };
  }
});
var repotypeGenerateSchemaCommand = new UniversalCommand({
  name: "repotype generate schema",
  description: "Generate frontmatter JSON schema from markdown content",
  scope: "project",
  keywords: ["repotype", "generate", "schema", "frontmatter"],
  input: {
    parameters: [
      { name: "target", type: "string", description: "File or directory target", positional: true, required: true },
      { name: "output", type: "string", description: "Output schema path", positional: true, required: true },
      { name: "pattern", type: "string", description: "Glob pattern when target is directory", positional: false, required: false }
    ]
  },
  output: { type: "json" },
  async handler({ target, output, pattern = "**/*.md" }) {
    return generateSchemaFromContent(target, output, pattern);
  }
});
var repotypeInitCommand = new UniversalCommand({
  name: "repotype init",
  description: "Initialize repotype.yaml from generic preset or external source",
  scope: "project",
  keywords: ["repotype", "init", "profile", "bootstrap"],
  input: {
    parameters: [
      { name: "target", type: "string", description: "Target directory", positional: true, required: false },
      { name: "type", type: "string", description: "Profile type (default)", positional: false, required: false },
      { name: "from", type: "string", description: "External config path", positional: false, required: false },
      { name: "force", type: "boolean", description: "Overwrite existing config", positional: false, required: false }
    ]
  },
  output: { type: "json" },
  async handler({ target = ".", type = "default", from, force = false }) {
    const metadata = getRepotypePresetMetadata();
    if (!metadata.types.includes(type)) {
      throw new Error(`Unsupported preset type '${type}'.`);
    }
    return initRepotypeConfig(target, { type, from, force });
  }
});
var repotypePluginsStatusCommand = new UniversalCommand({
  name: "repotype plugins status",
  description: "Show configured plugin requirement status",
  scope: "project",
  keywords: ["repotype", "plugins", "status"],
  input: {
    parameters: [
      { name: "target", type: "string", description: "Repository path", positional: true, required: false }
    ]
  },
  output: { type: "json" },
  async handler({ target = "." }) {
    return pluginStatus(target);
  }
});
var repotypePluginsInstallCommand = new UniversalCommand({
  name: "repotype plugins install",
  description: "Run configured plugin installation commands",
  scope: "project",
  keywords: ["repotype", "plugins", "install"],
  input: {
    parameters: [
      { name: "target", type: "string", description: "Repository path", positional: true, required: false }
    ]
  },
  output: { type: "json" },
  async handler({ target = "." }) {
    return installPluginRequirements(target);
  }
});
export {
  ValidationEngine,
  applyOperationsConfig,
  createPresetConfig,
  describePlugins,
  explainPath,
  explainRules,
  findConfig,
  fixPath,
  generateComplianceReport,
  generateFrontmatterSchemaFromContent,
  generateSchemaFromContent,
  getOperationsStatus,
  getRepotypePresetMetadata,
  initRepotypeConfig,
  installPluginRequirements,
  installPlugins,
  listPresetTypes,
  loadConfig,
  parseComplianceReportJson,
  pluginStatus,
  renderComplianceReport,
  renderComplianceReportFromJson,
  renderHtmlComplianceReport,
  renderMarkdownComplianceReport,
  renderTemplate,
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
  resolveEffectiveRules,
  runPluginPhase,
  scaffoldFromTemplate,
  startService,
  validatePath
};
//# sourceMappingURL=index.js.map