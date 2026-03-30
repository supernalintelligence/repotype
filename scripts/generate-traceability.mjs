#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const requirementsDir = path.join(packageRoot, '.supernal', 'requirements');
const outputDir = path.join(packageRoot, '.supernal', 'traceability');
const jsonOutput = path.join(outputDir, 'traceability.json');
const mdOutput = path.join(outputDir, 'traceability.md');
const args = new Set(process.argv.slice(2));
const checkMode = args.has('--check');

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return {};
  const end = content.indexOf('\n---', 4);
  if (end < 0) return {};
  const raw = content.slice(4, end);
  return yaml.load(raw) || {};
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function relFromPackage(inputPath) {
  const normalized = String(inputPath);
  if (path.isAbsolute(normalized)) return normalized;
  return normalized;
}

function pathExistsFromPackage(candidate) {
  const full = path.resolve(packageRoot, candidate);
  return fs.existsSync(full);
}

function collectRequirements() {
  if (!fs.existsSync(requirementsDir)) return [];
  const files = fs
    .readdirSync(requirementsDir)
    .filter((entry) => entry.toLowerCase().endsWith('.md'))
    .filter((entry) => entry.toLowerCase() !== 'readme.md')
    .sort();

  return files.map((fileName) => {
    const filePath = path.join(requirementsDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatter = parseFrontmatter(content);

    const tests = toArray(frontmatter.tests).map(relFromPackage);
    const stories = toArray(frontmatter.stories).map(relFromPackage);
    const evidence = toArray(frontmatter.evidence).map(relFromPackage);

    const testChecks = tests.map((testPath) => ({
      path: testPath,
      exists: pathExistsFromPackage(testPath),
    }));
    const storyChecks = stories.map((storyPath) => ({
      path: storyPath,
      exists: pathExistsFromPackage(storyPath),
    }));

    return {
      id: frontmatter.id || fileName.replace(/\.md$/i, ''),
      title: frontmatter.title || '',
      status: frontmatter.status || 'unknown',
      owner: frontmatter.owner || 'unknown',
      feature: frontmatter.feature || '',
      file: path.relative(packageRoot, filePath),
      tests,
      stories,
      evidence,
      checks: {
        tests: testChecks,
        stories: storyChecks,
      },
    };
  });
}

function buildSummary(requirements) {
  const totals = {
    requirements: requirements.length,
    testsLinked: 0,
    testsMissing: 0,
    storiesLinked: 0,
    storiesMissing: 0,
    evidenceLinked: 0,
  };

  for (const req of requirements) {
    totals.testsLinked += req.checks.tests.length;
    totals.testsMissing += req.checks.tests.filter((entry) => !entry.exists).length;
    totals.storiesLinked += req.checks.stories.length;
    totals.storiesMissing += req.checks.stories.filter((entry) => !entry.exists).length;
    totals.evidenceLinked += req.evidence.length;
  }

  return totals;
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Repotype Requirement Traceability');
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Package: ${report.packageRoot}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Requirements: ${report.summary.requirements}`);
  lines.push(`- Linked tests: ${report.summary.testsLinked} (missing: ${report.summary.testsMissing})`);
  lines.push(`- Linked stories: ${report.summary.storiesLinked} (missing: ${report.summary.storiesMissing})`);
  lines.push(`- Linked evidence artifacts: ${report.summary.evidenceLinked}`);
  lines.push('');
  lines.push('## Matrix');
  lines.push('');
  lines.push('| Requirement | Status | Feature | Tests | Stories | Evidence |');
  lines.push('| --- | --- | --- | ---: | ---: | ---: |');
  for (const req of report.requirements) {
    lines.push(
      `| ${req.id} | ${req.status} | ${req.feature || '-'} | ${req.tests.length} | ${req.stories.length} | ${req.evidence.length} |`,
    );
  }
  lines.push('');
  lines.push('## Missing Links');
  lines.push('');
  const missing = [];
  for (const req of report.requirements) {
    for (const t of req.checks.tests.filter((entry) => !entry.exists)) {
      missing.push(`- ${req.id}: missing test path \`${t.path}\``);
    }
    for (const s of req.checks.stories.filter((entry) => !entry.exists)) {
      missing.push(`- ${req.id}: missing story path \`${s.path}\``);
    }
  }
  if (missing.length === 0) {
    lines.push('- None');
  } else {
    lines.push(...missing);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const requirements = collectRequirements();
  const summary = buildSummary(requirements);

  const report = {
    generatedAt: new Date().toISOString(),
    packageRoot: packageRoot,
    summary,
    requirements,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(jsonOutput, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdOutput, renderMarkdown(report));

  console.log(`traceability json: ${jsonOutput}`);
  console.log(`traceability md: ${mdOutput}`);
  console.log(
    `requirements=${summary.requirements} testsLinked=${summary.testsLinked} testsMissing=${summary.testsMissing} storiesMissing=${summary.storiesMissing}`,
  );

  if (checkMode && (summary.testsMissing > 0 || summary.storiesMissing > 0 || summary.requirements === 0)) {
    console.error('Traceability check failed: missing links or no requirements found.');
    process.exit(1);
  }
}

main();
