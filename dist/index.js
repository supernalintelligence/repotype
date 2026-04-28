// src/core/config-loader.ts
import crypto from "crypto";
import fs2 from "fs";
import path2 from "path";
import { globSync as globSync2 } from "glob";
import yaml from "js-yaml";

// src/core/path-ignore.ts
import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { minimatch } from "minimatch";
var MATCH_OPTS = { dot: true, nocase: false, nocomment: true };
var STATIC_IGNORES = ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"];
function normalize(value) {
  return value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+$/, "");
}
function parseIgnoreLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  let raw = trimmed;
  let negated = false;
  if (raw.startsWith("!")) {
    negated = true;
    raw = raw.slice(1).trim();
  }
  if (!raw) {
    return null;
  }
  const directoryOnly = raw.endsWith("/");
  let pattern = directoryOnly ? raw.slice(0, -1) : raw;
  pattern = pattern.replace(/^\/+/, "");
  if (!pattern) {
    return null;
  }
  return {
    base: ".",
    pattern,
    negated,
    directoryOnly,
    hasSlash: pattern.includes("/")
  };
}
function toLocalPath(base, relativePath) {
  if (base === ".") {
    return relativePath;
  }
  if (relativePath === base) {
    return "";
  }
  if (relativePath.startsWith(`${base}/`)) {
    return relativePath.slice(base.length + 1);
  }
  return null;
}
function matchesRule(localPath, rule) {
  if (rule.directoryOnly) {
    const directoryPattern = normalize(rule.pattern);
    if (!directoryPattern) {
      return false;
    }
    return localPath === directoryPattern || minimatch(localPath, `${directoryPattern}/**`, MATCH_OPTS);
  }
  if (rule.hasSlash) {
    return minimatch(localPath, rule.pattern, MATCH_OPTS);
  }
  return minimatch(localPath, rule.pattern, { ...MATCH_OPTS, matchBase: true }) || minimatch(localPath, `**/${rule.pattern}`, MATCH_OPTS);
}
function collectIgnoreRules(repoRoot) {
  const root = path.resolve(repoRoot);
  const ignoreFiles = globSync("**/.*ignore*", {
    cwd: root,
    absolute: true,
    nodir: true,
    dot: true,
    ignore: STATIC_IGNORES
  }).sort((a, b) => {
    const depthDiff = normalize(path.relative(root, path.dirname(a))).split("/").length - normalize(path.relative(root, path.dirname(b))).split("/").length;
    return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
  });
  const rules = [];
  for (const ignoreFile of ignoreFiles) {
    const dirRel = normalize(path.relative(root, path.dirname(ignoreFile))) || ".";
    const lines = fs.readFileSync(ignoreFile, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseIgnoreLine(line);
      if (!parsed) {
        continue;
      }
      rules.push({
        ...parsed,
        base: dirRel
      });
    }
  }
  return rules;
}
function createIgnoreMatcher(repoRoot) {
  const root = path.resolve(repoRoot);
  const rules = collectIgnoreRules(root);
  return {
    isIgnored(absolutePath) {
      const rel = normalize(path.relative(root, path.resolve(absolutePath)));
      if (!rel || rel.startsWith("..")) {
        return false;
      }
      let ignored = false;
      for (const rule of rules) {
        const localPath = toLocalPath(rule.base, rel);
        if (localPath === null) {
          continue;
        }
        if (matchesRule(localPath, rule)) {
          ignored = !rule.negated;
        }
      }
      return ignored;
    }
  };
}
function getStaticIgnoreGlobs() {
  return [...STATIC_IGNORES];
}

// src/core/config-loader.ts
function findConfig(startPath) {
  const resolved = path2.resolve(startPath);
  const exists = fs2.existsSync(resolved);
  const initial = exists ? fs2.statSync(resolved).isDirectory() ? resolved : path2.dirname(resolved) : path2.dirname(resolved);
  let dir = initial;
  while (true) {
    const candidates = ["repotype.yaml", "repo-schema.yaml"];
    for (const name of candidates) {
      const candidate = path2.join(dir, name);
      if (fs2.existsSync(candidate)) {
        return candidate;
      }
    }
    const parent = path2.dirname(dir);
    if (parent === dir) {
      throw new Error("No schema config found. Expected repotype.yaml or repo-schema.yaml");
    }
    dir = parent;
  }
}
function parseConfigFile(configPath) {
  const raw = fs2.readFileSync(configPath, "utf8");
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
  const absolutePath = path2.resolve(configPath);
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
    const parentPath = path2.resolve(path2.dirname(absolutePath), parentRef);
    if (!fs2.existsSync(parentPath)) {
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
function collectExtendsDeps(configPath, seen = /* @__PURE__ */ new Set()) {
  const absolutePath = path2.resolve(configPath);
  if (seen.has(absolutePath)) return [];
  seen.add(absolutePath);
  let raw;
  try {
    raw = parseConfigFile(absolutePath);
  } catch {
    return [absolutePath];
  }
  const parents = asArray(raw.extends).map((p) => path2.resolve(path2.dirname(absolutePath), p));
  return [absolutePath, ...parents.flatMap((p) => collectExtendsDeps(p, seen))];
}
function hashConfigFiles(configPaths) {
  const allDeps = configPaths.flatMap((p) => collectExtendsDeps(p));
  const unique = [...new Set(allDeps)].sort();
  const hasher = crypto.createHash("sha256");
  for (const filePath of unique) {
    hasher.update(filePath);
    hasher.update("\0");
    try {
      hasher.update(fs2.readFileSync(filePath, "utf8"));
    } catch {
    }
    hasher.update("\0");
  }
  return hasher.digest("hex");
}
var CONFIG_NAMES = ["repotype.yaml", "repo-schema.yaml"];
var WORKSPACE_CACHE_VERSION = 2;
function discoverWorkspaces(rootDir, ignoreMatcher) {
  const root = path2.resolve(rootDir);
  const allPaths = globSync2(["**/repotype.yaml", "**/repo-schema.yaml"], {
    cwd: root,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs()
  });
  const rootConfigs = new Set(CONFIG_NAMES.map((n) => path2.join(root, n)));
  const candidates = allPaths.filter((p) => {
    if (rootConfigs.has(p)) return false;
    if (ignoreMatcher.isIgnored(p)) return false;
    return true;
  });
  const entries = candidates.map((configPath) => {
    const subtreeRoot = path2.resolve(path2.dirname(configPath));
    const depth = subtreeRoot.split(path2.sep).filter(Boolean).length;
    return { configPath, subtreeRoot, depth };
  });
  entries.sort((a, b) => {
    if (b.depth !== a.depth) return b.depth - a.depth;
    return a.subtreeRoot.localeCompare(b.subtreeRoot);
  });
  return entries;
}
function resolveOwningWorkspace(absoluteFilePath, workspaces) {
  for (const ws of workspaces) {
    if (absoluteFilePath === ws.subtreeRoot || absoluteFilePath.startsWith(ws.subtreeRoot + path2.sep)) {
      return ws;
    }
  }
  return "root";
}
function getCacheFilePath(repoRoot) {
  return path2.join(repoRoot, ".repotype", "cache", "workspace.json");
}
function loadWorkspaceCache(repoRoot) {
  const cachePath = getCacheFilePath(repoRoot);
  try {
    const raw = fs2.readFileSync(cachePath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.version !== WORKSPACE_CACHE_VERSION) return null;
    if (parsed.repoRoot !== path2.resolve(repoRoot)) return null;
    return parsed;
  } catch {
    return null;
  }
}
function writeWorkspaceCache(repoRoot, cache) {
  const cachePath = getCacheFilePath(repoRoot);
  const cacheDir = path2.dirname(cachePath);
  fs2.mkdirSync(cacheDir, { recursive: true });
  const tmpPath = `${cachePath}.${process.pid}.tmp`;
  try {
    fs2.writeFileSync(tmpPath, JSON.stringify(cache, null, 2), "utf8");
    fs2.renameSync(tmpPath, cachePath);
  } catch {
    try {
      fs2.unlinkSync(tmpPath);
    } catch {
    }
  }
}

// src/core/presets.ts
function baseDefaults() {
  return {
    inheritance: "merge",
    strictness: "balanced",
    unmatchedFiles: "deny"
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
      },
      {
        id: "repotype-config",
        glob: "repotype.yaml"
      }
    ]
  };
}
function strictPreset() {
  return {
    version: "1",
    defaults: {
      ...baseDefaults(),
      strictness: "strict",
      unmatchedFiles: "deny"
    },
    folders: [
      {
        id: "root-allowlist",
        path: ".",
        allowedFolders: ["docs", "schemas", "examples"],
        allowedFiles: ["repotype.yaml", "README.md"]
      }
    ],
    files: [
      { id: "repotype-config", glob: "repotype.yaml" },
      { id: "docs-markdown", glob: "docs/**/*.md" },
      { id: "schemas-json", glob: "schemas/**/*.json" },
      { id: "templates-markdown", glob: "examples/templates/**/*.md" }
    ]
  };
}
function createPresetConfig(type) {
  if (type === "default") return defaultPreset();
  if (type === "strict") return strictPreset();
  throw new Error(`Unsupported preset type '${type}'.`);
}
function listPresetTypes() {
  return ["default", "strict"];
}

// src/core/rule-engine.ts
import path3 from "path";

// src/core/glob.ts
import { minimatch as minimatch2 } from "minimatch";
function matchesGlob(pathValue, glob) {
  return minimatch2(pathValue, glob, { dot: true, nocase: false, nocomment: true });
}

// src/core/rule-engine.ts
function normalize2(p) {
  return p.replace(/\\\\/g, "/").replace(/^\.\//, "");
}
function folderRuleMatches(rule, relativePath) {
  const directory = normalize2(path3.dirname(relativePath));
  if (rule.path) {
    const rp = normalize2(rule.path);
    return directory === rp || directory.startsWith(`${rp}/`);
  }
  if (rule.glob) {
    return matchesGlob(directory, normalize2(rule.glob));
  }
  return false;
}
function resolveEffectiveRules(config, repoRoot, absoluteFilePath) {
  const relativePath = normalize2(path3.relative(repoRoot, absoluteFilePath));
  const folderRules = (config.folders || []).filter((rule) => folderRuleMatches(rule, relativePath));
  const fileRules = (config.files || []).filter((rule) => matchesGlob(relativePath, normalize2(rule.glob)));
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
import fs4 from "fs";
import path4 from "path";
import { globSync as globSync3 } from "glob";

// src/core/markdown.ts
import fs3 from "fs";
import yaml2 from "js-yaml";
function parseMarkdown(filePath) {
  const raw = fs3.readFileSync(filePath, "utf8");
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
  const absolute = path4.resolve(targetPath);
  const stat = fs4.statSync(absolute);
  const repoRoot = stat.isDirectory() ? absolute : path4.dirname(absolute);
  const ignoreMatcher = createIgnoreMatcher(repoRoot);
  if (stat.isFile()) {
    return ignoreMatcher.isIgnored(absolute) ? [] : [absolute];
  }
  const discovered = globSync3(pattern, {
    cwd: absolute,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs()
  });
  return discovered.filter((filePath) => !ignoreMatcher.isIgnored(filePath));
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
  const outputAbsolute = path4.resolve(outputPath);
  fs4.mkdirSync(path4.dirname(outputAbsolute), { recursive: true });
  fs4.writeFileSync(outputAbsolute, `${JSON.stringify(schema, null, 2)}
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
import path5 from "path";
import { execSync } from "child_process";
function runCommand(command, repoRoot) {
  const cwd = command.cwd ? path5.resolve(repoRoot, command.cwd) : repoRoot;
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
import fs5 from "fs";
import path6 from "path";
import Handlebars from "handlebars";
function renderTemplate(config, repoRoot, templateId, variables) {
  const template = (config.templates || []).find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  const templatePath = path6.resolve(repoRoot, template.path);
  const source = fs5.readFileSync(templatePath, "utf8");
  const compiled = Handlebars.compile(source, { noEscape: true });
  return compiled(variables);
}

// src/core/validator-framework.ts
import fs6 from "fs";
import os from "os";
import path7 from "path";
import { globSync as globSync4 } from "glob";
var CONFIG_FILE_NAMES = /* @__PURE__ */ new Set(["repotype.yaml", "repo-schema.yaml"]);
function scanFiles(targetPath, repoRoot, sharedIgnoreMatcher) {
  const ignoreMatcher = sharedIgnoreMatcher ?? createIgnoreMatcher(repoRoot);
  const stats = fs6.statSync(targetPath);
  if (stats.isFile()) {
    const absoluteFile = path7.resolve(targetPath);
    if (CONFIG_FILE_NAMES.has(path7.basename(absoluteFile))) return [];
    return ignoreMatcher.isIgnored(absoluteFile) ? [] : [absoluteFile];
  }
  const files = globSync4("**/*", {
    cwd: targetPath,
    absolute: true,
    nodir: true,
    ignore: getStaticIgnoreGlobs()
  });
  return files.filter((filePath) => {
    if (CONFIG_FILE_NAMES.has(path7.basename(filePath))) return false;
    return !ignoreMatcher.isIgnored(filePath);
  });
}
function createSemaphore(concurrency) {
  let active = 0;
  const queue = [];
  function next() {
    if (active < concurrency && queue.length > 0) {
      active++;
      const run = queue.shift();
      run();
    }
  }
  return function acquire(fn) {
    return new Promise((resolve, reject) => {
      queue.push(() => {
        fn().then(
          (value) => {
            active--;
            next();
            resolve(value);
          },
          (err) => {
            active--;
            next();
            reject(err);
          }
        );
      });
      next();
    });
  };
}
function classifyOverbroadGlob(glob) {
  const normalized = glob.replace(/\\+/g, "/");
  if (normalized === "**/*" || normalized.endsWith("/**") || normalized.endsWith("/**/*")) {
    return { level: "high", depth: 3 };
  }
  if (normalized.includes("/**/*.{")) {
    return { level: "medium", depth: 2 };
  }
  if (normalized.includes("/**/*.")) {
    return { level: "low", depth: 1 };
  }
  return null;
}
function lintConfigGlobs(config, configPath) {
  const diagnostics = [];
  for (const rule of config.files || []) {
    if (!rule.glob) continue;
    if (rule.lint?.allowOverbroad) continue;
    const classification = classifyOverbroadGlob(rule.glob);
    if (classification) {
      diagnostics.push({
        code: "overbroad_glob_pattern",
        message: `Overbroad file glob '${rule.glob}' in rule '${rule.id || "unnamed"}' (level: ${classification.level}, depth: ${classification.depth}). Prefer explicit allowlist paths.`,
        severity: "warning",
        file: configPath,
        ruleId: rule.id,
        details: {
          glob: rule.glob,
          level: classification.level,
          depth: classification.depth,
          recommendation: "Replace broad globs with explicit folder/file rules where possible."
        }
      });
    }
  }
  for (const rule of config.folders || []) {
    if (!rule.glob) continue;
    const classification = classifyOverbroadGlob(rule.glob);
    if (classification) {
      diagnostics.push({
        code: "overbroad_glob_pattern",
        message: `Overbroad folder glob '${rule.glob}' in rule '${rule.id || "unnamed"}' (level: ${classification.level}, depth: ${classification.depth}).`,
        severity: "warning",
        file: configPath,
        ruleId: rule.id,
        details: {
          glob: rule.glob,
          level: classification.level,
          depth: classification.depth,
          recommendation: "Use explicit folder paths in allowedFolders/requiredFolders."
        }
      });
    }
  }
  return diagnostics;
}
function getGlobExtension(glob) {
  const match = glob.match(/\*\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}
function globsCouldOverlap(globA, globB) {
  const extA = getGlobExtension(globA);
  const extB = getGlobExtension(globB);
  if (extA && extB && extA !== extB) return false;
  return true;
}
function rootGlobCouldMatchSubtree(rootGlob, relSubtreeFromRoot) {
  const normalized = rootGlob.replace(/\\/g, "/");
  if (normalized.startsWith("**/") || !normalized.includes("/")) return true;
  const firstWild = normalized.indexOf("*");
  const literalPrefix = firstWild >= 0 ? normalized.slice(0, firstWild) : normalized + "/";
  const relNorm = relSubtreeFromRoot.replace(/\\/g, "/") + "/";
  return relNorm.startsWith(literalPrefix) || literalPrefix.startsWith(relNorm);
}
function fileRulesConflict(rootRule, childRule) {
  const rootSections = [...rootRule.requiredSections ?? []].sort().join(",");
  const childSections = [...childRule.requiredSections ?? []].sort().join(",");
  if (rootSections !== childSections && (rootSections || childSections)) return true;
  if ((rootRule.schema?.schema ?? null) !== (childRule.schema?.schema ?? null)) return true;
  if ((rootRule.filenamePattern ?? null) !== (childRule.filenamePattern ?? null)) return true;
  if ((rootRule.pathCase ?? null) !== (childRule.pathCase ?? null)) return true;
  const rootForbid = [...rootRule.forbidContentPatterns ?? []].sort().join(",");
  const childForbid = [...childRule.forbidContentPatterns ?? []].sort().join(",");
  if (rootForbid !== childForbid && (rootForbid || childForbid)) return true;
  return false;
}
var ValidationEngine = class {
  constructor(adapters) {
    this.adapters = adapters;
  }
  async validate(targetPath, options) {
    const absoluteTarget = path7.resolve(targetPath);
    const targetRoot = fs6.existsSync(absoluteTarget) && fs6.statSync(absoluteTarget).isDirectory() ? absoluteTarget : path7.dirname(absoluteTarget);
    const configPath = options?.configPath ? path7.resolve(options.configPath) : findConfig(absoluteTarget);
    const repoRoot = options?.configPath ? targetRoot : path7.dirname(configPath);
    const config = loadConfig(configPath);
    const files = options?.fileList ?? scanFiles(absoluteTarget, repoRoot, options?.sharedIgnoreMatcher);
    const diagnostics = [...lintConfigGlobs(config, configPath)];
    for (const filePath of files) {
      const ruleSet = resolveEffectiveRules(config, repoRoot, filePath);
      const context = {
        repoRoot,
        configPath,
        config,
        ruleSet,
        globalFileIndex: options?.globalFileIndex
      };
      for (const adapter of this.adapters) {
        if (!adapter.supports(filePath, context)) {
          continue;
        }
        try {
          const adapterDiagnostics = await adapter.validate(filePath, context);
          if (options?.workspaceTag) {
            for (const d of adapterDiagnostics) {
              d.workspace = options.workspaceTag;
            }
          }
          diagnostics.push(...adapterDiagnostics);
        } catch (error) {
          diagnostics.push({
            code: "validator_adapter_failure",
            message: `${adapter.id} failed for ${context.ruleSet.filePath}: ${error.message}`,
            severity: "error",
            file: filePath,
            details: {
              adapter: adapter.id
            },
            workspace: options?.workspaceTag
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
  /**
   * Validate a workspace (root + all child workspace subtrees) in parallel.
   * Auto-detects child configs under rootDir.
   */
  async validateWorkspace(rootDir, options = {}) {
    const root = path7.resolve(rootDir);
    const rootConfigPath = findConfig(root);
    const repoRoot = path7.dirname(rootConfigPath);
    const sharedIgnoreMatcher = createIgnoreMatcher(repoRoot);
    const workspaces = discoverWorkspaces(repoRoot, sharedIgnoreMatcher);
    if (workspaces.length === 0) {
      const result = await this.validate(rootDir, { configPath: rootConfigPath, sharedIgnoreMatcher });
      return { mode: "flat", result };
    }
    const allConfigPaths = [rootConfigPath, ...workspaces.map((ws) => ws.configPath)];
    const currentHash = hashConfigFiles(allConfigPaths);
    let cachedWorkspaces = null;
    let cachedResolvedConfigs = null;
    let staleCIDiag = null;
    if (!options.noCache) {
      const cached = loadWorkspaceCache(repoRoot);
      if (cached && cached.hash === currentHash) {
        cachedWorkspaces = cached.workspaces;
        cachedResolvedConfigs = cached.resolvedConfigs;
      } else if (cached && process.env.CI === "true") {
        staleCIDiag = {
          code: "workspace_cache_stale",
          severity: "warning",
          message: "workspace cache is stale \u2014 regenerate locally with `repotype validate .`",
          parentConfigPath: rootConfigPath,
          childConfigPath: rootConfigPath
        };
        cachedWorkspaces = null;
        cachedResolvedConfigs = null;
      }
    }
    let activeWorkspaces = workspaces;
    if (cachedWorkspaces) {
      activeWorkspaces = cachedWorkspaces;
    } else if (!options.noCache && process.env.CI !== "true") {
      const resolvedConfigs = {};
      for (const ws of workspaces) {
        try {
          resolvedConfigs[ws.configPath] = loadConfig(ws.configPath);
        } catch {
        }
      }
      try {
        resolvedConfigs[rootConfigPath] = loadConfig(rootConfigPath);
      } catch {
      }
      writeWorkspaceCache(repoRoot, {
        version: 2,
        hash: currentHash,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        repoRoot,
        workspaces,
        resolvedConfigs
      });
    }
    const rootFiles = scanFiles(repoRoot, repoRoot, sharedIgnoreMatcher);
    const childFiles = activeWorkspaces.flatMap(
      (ws) => scanFiles(ws.subtreeRoot, repoRoot, sharedIgnoreMatcher)
    );
    const globalFileIndex = /* @__PURE__ */ new Set([...rootFiles, ...childFiles]);
    const concurrency = Math.min(activeWorkspaces.length + 1, 8, os.cpus().length);
    const semaphore = createSemaphore(concurrency);
    const childValidations = await Promise.all(
      activeWorkspaces.map(
        (ws) => semaphore(
          () => this.validate(ws.subtreeRoot, {
            configPath: ws.configPath,
            sharedIgnoreMatcher,
            globalFileIndex,
            workspaceTag: ws.configPath
          }).then((result) => ({ configPath: ws.configPath, subtreeRoot: ws.subtreeRoot, result }))
        )
      )
    );
    const allRootFiles = scanFiles(repoRoot, repoRoot, sharedIgnoreMatcher);
    const rootOwnedFiles = allRootFiles.filter(
      (f) => resolveOwningWorkspace(f, activeWorkspaces) === "root"
    );
    const rawRootResult = await semaphore(
      () => this.validate(repoRoot, {
        configPath: rootConfigPath,
        sharedIgnoreMatcher,
        globalFileIndex,
        workspaceTag: rootConfigPath,
        fileList: rootOwnedFiles
      })
    );
    const rootResult = {
      ok: rawRootResult.diagnostics.every((d) => d.severity !== "error"),
      diagnostics: rawRootResult.diagnostics,
      filesScanned: rootOwnedFiles.length
    };
    const conflicts = [];
    const rootConfig = loadConfig(rootConfigPath);
    for (const ws of activeWorkspaces) {
      let childConfig;
      try {
        childConfig = cachedResolvedConfigs?.[ws.configPath] ?? loadConfig(ws.configPath);
      } catch {
        continue;
      }
      for (const folder of rootConfig.folders ?? []) {
        for (const reqFile of folder.requiredFiles ?? []) {
          const absReqFile = path7.resolve(repoRoot, reqFile);
          if (absReqFile.startsWith(ws.subtreeRoot + path7.sep) || absReqFile === ws.subtreeRoot) {
            const childRequires = (childConfig.folders ?? []).some(
              (cf) => (cf.requiredFiles ?? []).some((rf) => path7.resolve(ws.subtreeRoot, rf) === absReqFile)
            );
            if (!childRequires) {
              conflicts.push({
                code: "workspace_required_file_gap",
                severity: "error",
                message: `Root config requires '${reqFile}' which is inside child subtree '${ws.subtreeRoot}'. Child config does not require it \u2014 enforcement gap.`,
                parentConfigPath: rootConfigPath,
                childConfigPath: ws.configPath,
                details: { requiredFile: reqFile, subtreeRoot: ws.subtreeRoot }
              });
            }
          }
        }
      }
      const relSubtree = path7.relative(repoRoot, ws.subtreeRoot);
      for (const rootRule of rootConfig.files ?? []) {
        if (!rootGlobCouldMatchSubtree(rootRule.glob, relSubtree)) continue;
        for (const childRule of childConfig.files ?? []) {
          if (!globsCouldOverlap(rootRule.glob, childRule.glob)) continue;
          if (fileRulesConflict(rootRule, childRule)) {
            conflicts.push({
              code: "workspace_pattern_conflict",
              severity: "warning",
              message: `Root rule glob '${rootRule.glob}' and child rule glob '${childRule.glob}' in '${ws.subtreeRoot}' may match the same files with different constraints.`,
              parentConfigPath: rootConfigPath,
              childConfigPath: ws.configPath,
              details: { rootGlob: rootRule.glob, childGlob: childRule.glob, subtreeRoot: ws.subtreeRoot }
            });
            break;
          }
        }
      }
      const rootUnmatched = rootConfig.defaults?.unmatchedFiles;
      const childUnmatched = childConfig.defaults?.unmatchedFiles;
      if (rootUnmatched && childUnmatched && rootUnmatched !== childUnmatched) {
        conflicts.push({
          code: "workspace_unmatched_files_asymmetry",
          severity: "warning",
          message: `Root config has unmatchedFiles='${rootUnmatched}' but child config '${ws.subtreeRoot}' has unmatchedFiles='${childUnmatched}'. Files in child subtree are subject to different rules.`,
          parentConfigPath: rootConfigPath,
          childConfigPath: ws.configPath,
          details: { rootUnmatched, childUnmatched }
        });
      }
    }
    if (staleCIDiag) {
      conflicts.push(staleCIDiag);
    }
    if (!cachedWorkspaces) {
      const activationDiag = {
        code: "workspace_mode_active",
        severity: "suggestion",
        message: `workspace mode active \u2014 ${activeWorkspaces.length} child config(s) found. Files in child subtrees are now governed by their own repotype.yaml. Root rules no longer apply to those subtrees. Run \`repotype status\` to review workspace boundaries.`,
        file: rootConfigPath,
        workspace: rootConfigPath
      };
      rootResult.diagnostics.unshift(activationDiag);
    }
    const totalFilesScanned = rootResult.filesScanned + childValidations.reduce((acc, cv) => acc + cv.result.filesScanned, 0);
    const allOk = rootResult.ok && childValidations.every((cv) => cv.result.ok) && !conflicts.some((c) => c.severity === "error");
    const workspaceResult = {
      ok: allOk,
      mode: "workspace",
      filesScanned: totalFilesScanned,
      workspaces: childValidations,
      conflicts,
      rootResult
    };
    return { mode: "workspace", result: workspaceResult };
  }
};

// src/cli/use-cases.ts
import fs15 from "fs";
import path17 from "path";

// src/core/autofix.ts
import fs7 from "fs";
function applyToFile(file, action) {
  const raw = fs7.readFileSync(file, "utf8");
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
  fs7.writeFileSync(file, serializeMarkdown(frontmatter, body));
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
import fs8 from "fs";
import path8 from "path";
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
    const base = path8.dirname(filePath);
    for (const field of cross.fields) {
      const refs = asStringArray(parsed.frontmatter[field]);
      for (const ref of refs) {
        if (!cross.allowAbsolute && path8.isAbsolute(ref)) {
          diagnostics.push({
            code: "invalid_reference_absolute",
            message: `Absolute path not allowed in ${field}: ${ref}`,
            severity: "error",
            file: filePath
          });
          continue;
        }
        const resolved = path8.resolve(base, ref);
        const exists = context.globalFileIndex ? context.globalFileIndex.has(resolved) : fs8.existsSync(resolved);
        if (!exists) {
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
          const ext = path8.extname(resolved);
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

// src/adapters/cross-file-rule-adapter.ts
import path9 from "path";
import { globSync as globSync5 } from "glob";
import { minimatch as minimatch3 } from "minimatch";
var CrossFileRuleAdapter = class {
  id = "cross-file-rule";
  supports(filePath, context) {
    const rules = context.config.rules ?? [];
    return rules.some(
      (r) => r.kind === "cross_reference" && r.field && r.target && minimatch3(path9.relative(context.repoRoot, filePath).replace(/\\/g, "/"), r.sourceGlob, { dot: true })
    );
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const rules = context.config.rules ?? [];
    const relPath = path9.relative(context.repoRoot, filePath).replace(/\\/g, "/");
    for (const rule of rules) {
      if (rule.kind !== "cross_reference") continue;
      if (!rule.field || !rule.target) continue;
      if (!minimatch3(relPath, rule.sourceGlob, { dot: true })) continue;
      const severity = rule.severity ?? "error";
      let parsed;
      try {
        parsed = parseMarkdown(filePath);
      } catch (error) {
        diagnostics.push({
          code: "invalid_frontmatter_yaml",
          message: `Invalid YAML frontmatter: ${error.message}`,
          severity: "error",
          file: filePath,
          ruleId: rule.id
        });
        continue;
      }
      const rawValue = parsed.frontmatter[rule.field];
      if (rule.optional) {
        if (rawValue === void 0 || rawValue === null || rawValue === "") continue;
      }
      if (typeof rawValue !== "string" || rawValue.trim() === "") continue;
      const fieldValue = rawValue.trim();
      const targetGlob = rule.target.replace("{field_value}", fieldValue);
      const absoluteGlob = path9.isAbsolute(targetGlob) ? targetGlob : path9.join(context.repoRoot, targetGlob);
      let matches;
      if (context.globalFileIndex) {
        const normalizedGlob = absoluteGlob.replace(/\\/g, "/");
        matches = [];
        for (const entry of context.globalFileIndex) {
          if (minimatch3(entry.replace(/\\/g, "/"), normalizedGlob, { dot: true })) {
            matches.push(entry);
            break;
          }
        }
      } else {
        matches = globSync5(absoluteGlob.replace(/\\/g, "/"), { dot: true });
      }
      if (matches.length === 0) {
        diagnostics.push({
          code: "broken_cross_file_reference",
          message: `Rule '${rule.id}': field '${rule.field}' value '${fieldValue}' does not resolve to any file matching '${rule.target}'`,
          severity,
          file: filePath,
          ruleId: rule.id,
          details: {
            field: rule.field,
            value: fieldValue,
            targetPattern: rule.target
          }
        });
      }
    }
    return diagnostics;
  }
};

// src/adapters/content-policy-adapter.ts
import fs9 from "fs";
var ContentPolicyAdapter = class {
  id = "content-policy";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some(
      (rule) => Array.isArray(rule.forbidContentPatterns) && rule.forbidContentPatterns.length > 0
    );
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const raw = fs9.readFileSync(filePath, "utf8");
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
            severity: rule.forbidContentSeverity ?? "error",
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
import fs10 from "fs";
import path10 from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml3 from "js-yaml";
var ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
function loadSchema(repoRoot, schemaRef) {
  const schemaPath = path10.resolve(repoRoot, schemaRef);
  const schemaRaw = fs10.readFileSync(schemaPath, "utf8");
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
    const schemaPath = path10.resolve(context.repoRoot, schemaRef);
    if (!fs10.existsSync(schemaPath)) {
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
    const raw = fs10.readFileSync(filePath, "utf8");
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
import path11 from "path";
var FilenameAdapter = class {
  id = "filename";
  supports(_filePath, context) {
    return context.ruleSet.fileRules.some((rule) => Boolean(rule.filenamePattern));
  }
  async validate(filePath, context) {
    const name = path11.basename(filePath);
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
import fs11 from "fs";
import path12 from "path";
import { globSync as globSync6 } from "glob";
function hasGlobChars(value) {
  return /[*?[\]{}()!+@]/.test(value);
}
function matchesAny(name, patterns) {
  return patterns.some((pattern) => matchesGlob(name, pattern));
}
function collectTargetDirectories(rule, repoRoot, ignoreMatcher) {
  if (rule.path) {
    const resolved = path12.resolve(repoRoot, rule.path);
    return ignoreMatcher.isIgnored(resolved) ? [] : [resolved];
  }
  if (rule.glob) {
    const matched = globSync6(rule.glob, {
      cwd: repoRoot,
      absolute: true,
      nodir: false,
      dot: true,
      ignore: getStaticIgnoreGlobs()
    });
    return matched.filter(
      (entry) => !ignoreMatcher.isIgnored(entry) && fs11.existsSync(entry) && fs11.statSync(entry).isDirectory()
    );
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
    const ignoreMatcher = createIgnoreMatcher(context.repoRoot);
    for (const rule of folderRules) {
      const targets = collectTargetDirectories(rule, context.repoRoot, ignoreMatcher);
      if (rule.path && targets.length === 1 && !fs11.existsSync(targets[0])) {
        diagnostics.push({
          code: "folder_rule_path_missing",
          message: `Folder rule target path does not exist: ${rule.path}`,
          severity: "error",
          file: path12.resolve(context.repoRoot, rule.path),
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
        if (!fs11.existsSync(targetDir) || !fs11.statSync(targetDir).isDirectory()) {
          continue;
        }
        const entries = fs11.readdirSync(targetDir, { withFileTypes: true }).filter((entry) => !ignoreMatcher.isIgnored(path12.join(targetDir, entry.name)));
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
import fs12 from "fs";
import path13 from "path";
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
    const schemaPath = path13.resolve(context.repoRoot, schemaRef);
    if (!fs12.existsSync(schemaPath)) {
      return [
        {
          code: "schema_not_found",
          message: `Schema file not found: ${schemaRef}`,
          severity: "error",
          file: filePath
        }
      ];
    }
    const schemaRaw = fs12.readFileSync(schemaPath, "utf8");
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
import path14 from "path";
import fs13 from "fs";
import { minimatch as minimatch4 } from "minimatch";
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
      return minimatch4(relativePath, folder.glob, { dot: true });
    }
    return false;
  });
}
function normalizePath(p) {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}
function isTemplateSource(relativePath) {
  const normalized = normalizePath(relativePath);
  return normalized.includes("/templates/") || normalized.endsWith(".template.md");
}
function isRepotypeSystemFile(relativePath) {
  const normalized = normalizePath(relativePath);
  return normalized === "repotype.yaml" || normalized === "repo-schema.yaml";
}
function isReferencedByConfig(relativePath, context) {
  const normalized = normalizePath(relativePath);
  if ((context.config.templates || []).some((t) => normalizePath(t.path) === normalized)) {
    return true;
  }
  for (const rule of context.config.files || []) {
    if (rule.schema && normalizePath(rule.schema.schema) === normalized) {
      return true;
    }
  }
  for (const folder of context.config.folders || []) {
    const bindings = folder.schemaBindings || {};
    for (const key of Object.keys(bindings)) {
      const binding = bindings[key];
      if (normalizePath(binding.schema) === normalized) {
        return true;
      }
    }
  }
  return false;
}
var GuidanceAdapter = class {
  id = "guidance";
  supports(_filePath, _context) {
    return true;
  }
  async validate(filePath, context) {
    const diagnostics = [];
    const relative = context.ruleSet.filePath;
    const strictUnmatchedPolicy = context.config.defaults?.unmatchedFiles ?? "deny";
    if (context.ruleSet.fileRules.length === 0) {
      if (isRepotypeSystemFile(relative) || isReferencedByConfig(relative, context)) {
        return diagnostics;
      }
      if (strictUnmatchedPolicy === "allow") {
        diagnostics.push({
          code: "no_matching_file_rule",
          message: `No file rule matched '${relative}'. Legacy permissive mode is enabled (defaults.unmatchedFiles=allow).`,
          severity: "suggestion",
          file: filePath,
          details: {
            mode: "permissive",
            recommendation: "Set defaults.unmatchedFiles to deny for strict deny-by-default enforcement."
          }
        });
        return diagnostics;
      }
      if (!isInManagedFolderScope(relative, context) && (context.config.folders || []).length > 0) {
      }
      diagnostics.push({
        code: "no_matching_file_rule",
        message: `No file rule matched '${relative}'. Deny-by-default policy requires explicit file allow rules.`,
        severity: "error",
        file: filePath,
        details: {
          mode: "deny",
          example: `files:
  - id: ${path14.basename(relative, path14.extname(relative)) || "rule-id"}
    glob: "${relative}"`,
          compatibilityEscapeHatch: "defaults.unmatchedFiles: allow"
        }
      });
      return diagnostics;
    }
    if (!filePath.endsWith(".md")) {
      return diagnostics;
    }
    const body = fs13.readFileSync(filePath, "utf8");
    const hasFrontmatter = body.startsWith("---\n");
    if (!context.ruleSet.schema && hasFrontmatter && !isTemplateSource(relative)) {
      diagnostics.push({
        code: "missing_schema_binding",
        message: `Matched rule(s) for '${relative}' but no frontmatter schema is bound. Generate one with: repotype generate schema "${path14.dirname(filePath)}" "schemas/${path14.basename(path14.dirname(filePath))}.frontmatter.schema.json"`,
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
import fs14 from "fs";
import path15 from "path";
function stripFencedCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, "");
}
function stripInlineCode(content) {
  return content.replace(/`[^`]*`/g, "");
}
function loadTemplateRequiredFields(templatePath) {
  if (!fs14.existsSync(templatePath)) {
    return [];
  }
  const raw = fs14.readFileSync(templatePath, "utf8");
  const parsed = parseMarkdownContent(raw);
  return Object.keys(parsed.frontmatter || {}).filter((key) => !key.startsWith("_"));
}
function loadTemplateSections(templatePath) {
  if (!fs14.existsSync(templatePath)) {
    return [];
  }
  const raw = fs14.readFileSync(templatePath, "utf8");
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
        const templatePath = path15.resolve(context.repoRoot, template.path);
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
import path16 from "path";
function normalize3(p) {
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
  const normalized = normalize3(relativePath);
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0) {
    return [];
  }
  const last = parts[parts.length - 1];
  const ext = path16.extname(last);
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
    new CrossFileRuleAdapter(),
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
  if (fs15.existsSync(targetPath) && fs15.statSync(targetPath).isDirectory()) {
    return targetPath;
  }
  return path17.dirname(targetPath);
}
async function validatePath(target, configOverridePath, opts = {}) {
  const absolute = path17.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path17.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path17.dirname(configPath);
  const config = loadConfig(configPath);
  const engine = createDefaultEngine();
  const isDirectory = fs15.existsSync(absolute) && fs15.statSync(absolute).isDirectory();
  const workspaceEnabled = opts.workspace !== false;
  if (isDirectory && workspaceEnabled && !configOverridePath) {
    const wsResult = await engine.validateWorkspace(absolute, { noCache: opts.noCache });
    if (wsResult.mode === "workspace") {
      const pluginDiagnostics3 = runPluginPhase(config, repoRoot, "validate");
      if (pluginDiagnostics3.length > 0) {
        wsResult.result.rootResult.diagnostics.push(...pluginDiagnostics3);
        wsResult.result.rootResult.ok = wsResult.result.rootResult.diagnostics.every(
          (d) => d.severity !== "error"
        );
        wsResult.result.ok = wsResult.result.ok && wsResult.result.rootResult.ok;
      }
      return wsResult;
    }
    const pluginDiagnostics2 = runPluginPhase(config, repoRoot, "validate");
    const diagnostics2 = [...wsResult.result.diagnostics, ...pluginDiagnostics2];
    return {
      mode: "flat",
      result: {
        ...wsResult.result,
        diagnostics: diagnostics2,
        ok: diagnostics2.every((d) => d.severity !== "error")
      }
    };
  }
  const result = await engine.validate(target, { configPath });
  const pluginDiagnostics = runPluginPhase(config, repoRoot, "validate");
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];
  return {
    mode: "flat",
    result: {
      ...result,
      diagnostics,
      ok: diagnostics.every((d) => d.severity !== "error")
    }
  };
}
function explainPath(target, configOverridePath) {
  const absolute = path17.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path17.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path17.dirname(configPath);
  const config = loadConfig(configPath);
  return explainRules(config, repoRoot, absolute);
}
async function fixPath(target, configOverridePath, opts = {}) {
  const absolute = path17.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path17.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path17.dirname(configPath);
  const config = loadConfig(configPath);
  const validateResult = await validatePath(target, configOverridePath, opts);
  if (validateResult.mode === "workspace") {
    const wsResult = validateResult.result;
    const rootActions = wsResult.rootResult.diagnostics.map((d) => d.autofix).filter((action) => Boolean(action));
    const rootFix = applyAutofixes(rootActions);
    const childFixes = wsResult.workspaces.map((ws) => {
      const actions2 = ws.result.diagnostics.map((d) => d.autofix).filter((action) => Boolean(action));
      const fix = applyAutofixes(actions2);
      return { configPath: ws.configPath, subtreeRoot: ws.subtreeRoot, fix };
    });
    const pluginDiagnostics2 = runPluginPhase(config, repoRoot, "fix");
    wsResult.rootResult.diagnostics.push(...pluginDiagnostics2);
    wsResult.rootResult.ok = wsResult.rootResult.diagnostics.every((d) => d.severity !== "error");
    wsResult.ok = wsResult.ok && wsResult.rootResult.ok;
    const totalApplied = rootFix.applied + childFixes.reduce((acc, cf) => acc + cf.fix.applied, 0);
    return {
      validation: validateResult,
      fix: { applied: totalApplied },
      workspaceFixes: { root: rootFix, children: childFixes }
    };
  }
  const result = validateResult.result;
  const actions = result.diagnostics.map((d) => d.autofix).filter((action) => Boolean(action));
  const fixResult = applyAutofixes(actions);
  const pluginDiagnostics = runPluginPhase(config, repoRoot, "fix");
  const diagnostics = [...result.diagnostics, ...pluginDiagnostics];
  const validation = {
    mode: "flat",
    result: {
      ...result,
      diagnostics,
      ok: diagnostics.every((d) => d.severity !== "error")
    }
  };
  return {
    validation,
    fix: fixResult
  };
}
function scaffoldFromTemplate(templateId, outputPath, variables) {
  const absolute = path17.resolve(outputPath);
  const configPath = findConfig(absolute);
  const repoRoot = path17.dirname(configPath);
  const config = loadConfig(configPath);
  const content = renderTemplate(config, repoRoot, templateId, variables);
  const parent = path17.dirname(absolute);
  if (!fs15.existsSync(parent)) {
    fs15.mkdirSync(parent, { recursive: true });
  }
  fs15.writeFileSync(absolute, content);
  return absolute;
}
function generateSchemaFromContent(target, output, pattern = "**/*.md") {
  return generateFrontmatterSchemaFromContent(target, output, pattern);
}
function initRepotypeConfig(targetDir, options = {}) {
  const type = options.type ?? "default";
  const force = options.force ?? false;
  const absoluteTarget = path17.resolve(targetDir);
  const outputPath = path17.join(absoluteTarget, "repotype.yaml");
  if (fs15.existsSync(outputPath) && !force) {
    throw new Error(`repotype.yaml already exists at ${outputPath}. Use --force to overwrite.`);
  }
  const config = options.from ? yaml4.load(fs15.readFileSync(path17.resolve(options.from), "utf8")) : createPresetConfig(type);
  if (!config || typeof config !== "object" || !config.version) {
    throw new Error('Source config is invalid. Expected YAML with top-level "version".');
  }
  const rendered = yaml4.dump(config, { lineWidth: 120 });
  fs15.mkdirSync(absoluteTarget, { recursive: true });
  fs15.writeFileSync(outputPath, rendered);
  return {
    outputPath,
    source: options.from ? `file:${path17.resolve(options.from)}` : `preset:${type}`
  };
}
function getRepotypePresetMetadata() {
  return {
    types: listPresetTypes()
  };
}
function installPluginRequirements(target) {
  const absolute = path17.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path17.dirname(configPath);
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
  const absolute = path17.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path17.dirname(configPath);
  const config = loadConfig(configPath);
  const plugins = describePlugins(config);
  return {
    repoRoot,
    configPath,
    plugins
  };
}
async function generateComplianceReport(target, format = "markdown", configOverridePath) {
  const absolute = path17.resolve(target);
  const targetRoot = deriveTargetRoot(absolute);
  const configPath = configOverridePath ? path17.resolve(configOverridePath) : findConfig(absolute);
  const repoRoot = configOverridePath ? targetRoot : path17.dirname(configPath);
  const validateResult = await validatePath(target, configOverridePath);
  const allDiagnostics = validateResult.mode === "workspace" ? [
    ...validateResult.result.rootResult.diagnostics,
    ...validateResult.result.workspaces.flatMap((ws) => ws.result.diagnostics)
  ] : validateResult.result.diagnostics;
  const ok = validateResult.result.ok;
  const filesScanned = validateResult.result.filesScanned;
  const totals = allDiagnostics.reduce(
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
  for (const diagnostic of allDiagnostics) {
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
  const sampleFindings = allDiagnostics.slice(0, 50).map((diagnostic) => ({
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
    ok,
    filesScanned,
    totals,
    byCode,
    sampleFindings
  };
  return {
    ok,
    report,
    rendered: renderComplianceReport(report, format)
  };
}

// src/cli/operations.ts
import fs18 from "fs";
import path20 from "path";

// src/cli/git-hooks.ts
import fs16 from "fs";
import path18 from "path";
var START_MARKER = "# >>> repotype-checks >>>";
var END_MARKER = "# <<< repotype-checks <<<";
var MARKER_REGEX = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}\\n?`, "m");
function findGitRoot(startPath) {
  let dir = path18.resolve(startPath);
  if (fs16.existsSync(dir) && fs16.statSync(dir).isFile()) {
    dir = path18.dirname(dir);
  }
  while (true) {
    const gitPath = path18.join(dir, ".git");
    if (fs16.existsSync(gitPath)) {
      return dir;
    }
    const parent = path18.dirname(dir);
    if (parent === dir) {
      throw new Error("No .git directory found in current or parent directories");
    }
    dir = parent;
  }
}
function resolveGitDir(repoRoot) {
  const dotGit = path18.join(repoRoot, ".git");
  if (!fs16.existsSync(dotGit)) {
    throw new Error(`.git path not found for repo root: ${repoRoot}`);
  }
  const stat = fs16.statSync(dotGit);
  if (stat.isDirectory()) {
    return dotGit;
  }
  if (stat.isFile()) {
    const content = fs16.readFileSync(dotGit, "utf8").trim();
    const match = content.match(/^gitdir:\s*(.+)$/i);
    if (!match) {
      throw new Error(`Unsupported .git file format at: ${dotGit}`);
    }
    const rawGitDir = match[1].trim();
    return path18.isAbsolute(rawGitDir) ? rawGitDir : path18.resolve(repoRoot, rawGitDir);
  }
  throw new Error(`Unsupported .git path type at: ${dotGit}`);
}
function resolveHooksDir(repoRoot) {
  const gitDir = resolveGitDir(repoRoot);
  const hooksDir = path18.join(gitDir, "hooks");
  if (!fs16.existsSync(hooksDir)) {
    fs16.mkdirSync(hooksDir, { recursive: true });
  }
  return hooksDir;
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
  if (!fs16.existsSync(hookFile)) {
    fs16.writeFileSync(hookFile, `${shebang}${snippet}`);
    fs16.chmodSync(hookFile, 493);
    return "created";
  }
  let current = fs16.readFileSync(hookFile, "utf8");
  if (!current.startsWith("#!")) {
    current = `${shebang}${current}`;
  }
  if (MARKER_REGEX.test(current)) {
    const next = current.replace(MARKER_REGEX, snippet);
    if (next === current) {
      fs16.chmodSync(hookFile, 493);
      return "unchanged";
    }
    fs16.writeFileSync(hookFile, next);
    fs16.chmodSync(hookFile, 493);
    return "updated";
  }
  const separator = current.endsWith("\n") ? "\n" : "\n\n";
  fs16.writeFileSync(hookFile, `${current}${separator}${snippet}`);
  fs16.chmodSync(hookFile, 493);
  return "updated";
}
function installChecks(options) {
  const repoRoot = findGitRoot(options.target);
  const hooksDir = resolveHooksDir(repoRoot);
  const hookNames = options.hook === "both" ? ["pre-commit", "pre-push"] : [options.hook];
  const snippet = makeHookSnippet(repoRoot);
  const hooks = hookNames.map((hook) => {
    const hookPath = path18.join(hooksDir, hook);
    const status = upsertHook(hookPath, snippet);
    return { hook, status, path: hookPath };
  });
  return { repoRoot, hooks };
}
function inspectChecks(target) {
  const repoRoot = findGitRoot(target);
  const hooksDir = resolveHooksDir(repoRoot);
  const hookNames = ["pre-commit", "pre-push"];
  const hooks = hookNames.map((hook) => {
    const hookPath = path18.join(hooksDir, hook);
    if (!fs16.existsSync(hookPath)) {
      return { hook, path: hookPath, exists: false, managed: false };
    }
    const content = fs16.readFileSync(hookPath, "utf8");
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
  const hooksDir = resolveHooksDir(repoRoot);
  const hookNames = options.hook === "both" ? ["pre-commit", "pre-push"] : [options.hook];
  const hooks = hookNames.map((hook) => {
    const hookPath = path18.join(hooksDir, hook);
    if (!fs16.existsSync(hookPath)) {
      return { hook, status: "not_found", path: hookPath };
    }
    const current = fs16.readFileSync(hookPath, "utf8");
    if (!MARKER_REGEX.test(current)) {
      return { hook, status: "unchanged", path: hookPath };
    }
    const next = current.replace(MARKER_REGEX, "").trimEnd();
    fs16.writeFileSync(hookPath, next.length > 0 ? `${next}
` : "");
    fs16.chmodSync(hookPath, 493);
    return { hook, status: "removed", path: hookPath };
  });
  return { repoRoot, hooks };
}

// src/cli/watcher.ts
import fs17 from "fs";
import path19 from "path";
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
  const target = path19.resolve(options.target);
  const queueDir = path19.resolve(options.queueDir);
  const logFile = path19.resolve(options.logFile);
  fs17.mkdirSync(path19.dirname(logFile), { recursive: true });
  fs17.mkdirSync(queueDir, { recursive: true });
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
  const resolved = path19.resolve(target);
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
  const resolved = path19.resolve(target);
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
  const absolute = path20.resolve(target);
  const configPath = findConfig(absolute);
  const repoRoot = path20.dirname(configPath);
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
      queueDir: path20.resolve(repoRoot, config.operations?.watcher?.queueDir ?? "sort_queue"),
      minErrors: config.operations?.watcher?.minErrors ?? 3,
      logFile: path20.resolve(repoRoot, config.operations?.watcher?.logFile ?? ".repotype/logs/watcher.log")
    }
  };
  return {
    repoRoot,
    configPath,
    config: normalized
  };
}
function readLastCleanupEntry(queueDir) {
  const logPath = path20.join(queueDir, "cleanup-log.jsonl");
  if (!fs18.existsSync(logPath)) {
    return { found: false };
  }
  const lines = fs18.readFileSync(logPath, "utf8").split("\n").map((line) => line.trim()).filter(Boolean);
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
  const ignoreMatcher = createIgnoreMatcher(normalized.repoRoot);
  const childWorkspaces = discoverWorkspaces(normalized.repoRoot, ignoreMatcher);
  const workspace = {
    mode: childWorkspaces.length > 0 ? "workspace" : "flat",
    childCount: childWorkspaces.length,
    children: childWorkspaces.map((ws) => ({ configPath: ws.configPath, subtreeRoot: ws.subtreeRoot }))
  };
  return {
    repoRoot: normalized.repoRoot,
    configPath: normalized.configPath,
    config: normalized.config,
    hooks,
    watcher,
    cleanup,
    workspace
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
      const configPath = typeof req.body?.config === "string" ? req.body.config : void 0;
      const workspaceEnabled = req.body?.workspace !== false;
      const noCache = req.body?.noCache === true;
      const validateResult = await validatePath(target, configPath, {
        workspace: workspaceEnabled,
        noCache
      });
      const ok = validateResult.result.ok;
      res.status(ok ? 200 : 422).json({ ok, ...validateResult });
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
import path22 from "path";

// src/cli/cleanup.ts
import fs19 from "fs";
import path21 from "path";
function ensureDir(dir) {
  if (!fs19.existsSync(dir)) {
    fs19.mkdirSync(dir, { recursive: true });
  }
}
function getTimestamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function dedupe(items) {
  return [...new Set(items)];
}
function safeDestination(baseQueue, targetRoot, sourceFile) {
  const relative = path21.relative(targetRoot, sourceFile);
  const clamped = relative.startsWith("..") ? path21.basename(sourceFile) : relative;
  const destination = path21.join(baseQueue, clamped);
  if (!fs19.existsSync(destination)) {
    return destination;
  }
  const ext = path21.extname(destination);
  const stem = destination.slice(0, destination.length - ext.length);
  return `${stem}.moved-${Date.now()}${ext}`;
}
function writeAuditLogs(queueDir, entries) {
  ensureDir(queueDir);
  const jsonlPath = path21.join(queueDir, "cleanup-log.jsonl");
  const textPath = path21.join(queueDir, "cleanup-log.md");
  for (const entry of entries) {
    fs19.appendFileSync(jsonlPath, `${JSON.stringify(entry)}
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
    fs19.appendFileSync(textPath, summary);
  }
}
async function runCleanup(options) {
  const targetRoot = path21.resolve(options.target);
  const queueDir = path21.resolve(options.queueDir);
  ensureDir(queueDir);
  const validateResult = await validatePath(targetRoot);
  const allDiagnostics = validateResult.mode === "workspace" ? [
    ...validateResult.result.rootResult.diagnostics,
    ...validateResult.result.workspaces.flatMap((ws) => ws.result.diagnostics)
  ] : validateResult.result.diagnostics;
  const validation = {
    diagnostics: allDiagnostics,
    filesScanned: validateResult.result.filesScanned
  };
  const errorDiagnostics = validation.diagnostics.filter((d) => d.severity === "error");
  const files = dedupe(errorDiagnostics.map((d) => d.file));
  const entries = [];
  let moved = 0;
  for (const file of files) {
    if (!fs19.existsSync(file)) {
      continue;
    }
    const diagnostics = errorDiagnostics.filter((d) => d.file === file);
    if (diagnostics.length < options.minErrors) {
      continue;
    }
    const destination = safeDestination(queueDir, targetRoot, file);
    ensureDir(path21.dirname(destination));
    if (!options.dryRun) {
      fs19.renameSync(file, destination);
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
    const validateResult = await validatePath(target, config);
    if (validateResult.mode === "workspace") {
      const wsResult = validateResult.result;
      const allDiagnostics = [
        ...wsResult.rootResult.diagnostics,
        ...wsResult.workspaces.flatMap((ws) => ws.result.diagnostics)
      ];
      return {
        ok: wsResult.ok,
        filesScanned: wsResult.filesScanned,
        diagnostics: allDiagnostics,
        mode: "workspace",
        workspaces: wsResult.workspaces.map((ws) => ws.subtreeRoot)
      };
    }
    return {
      ok: validateResult.result.ok,
      filesScanned: validateResult.result.filesScanned,
      diagnostics: validateResult.result.diagnostics,
      mode: "flat"
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
    const absoluteTarget = path22.resolve(target);
    const queueDir = path22.isAbsolute(queue) ? queue : path22.resolve(absoluteTarget, queue);
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
    const resolvedTarget = path22.resolve(target);
    const queueDir = path22.isAbsolute(queue) ? queue : path22.resolve(resolvedTarget, queue);
    const resolvedLogFile = path22.isAbsolute(logFile) ? logFile : path22.resolve(resolvedTarget, logFile);
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
  collectExtendsDeps,
  createPresetConfig,
  describePlugins,
  discoverWorkspaces,
  explainPath,
  explainRules,
  findConfig,
  fixPath,
  generateComplianceReport,
  generateFrontmatterSchemaFromContent,
  generateSchemaFromContent,
  getOperationsStatus,
  getRepotypePresetMetadata,
  hashConfigFiles,
  initRepotypeConfig,
  installPluginRequirements,
  installPlugins,
  listPresetTypes,
  loadConfig,
  loadWorkspaceCache,
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
  resolveOwningWorkspace,
  runPluginPhase,
  scaffoldFromTemplate,
  scanFiles,
  startService,
  validatePath,
  writeWorkspaceCache
};
//# sourceMappingURL=index.js.map