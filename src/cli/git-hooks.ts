import fs from 'node:fs';
import path from 'node:path';

const START_MARKER = '# >>> repotype-checks >>>';
const END_MARKER = '# <<< repotype-checks <<<';
const MARKER_REGEX = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}\\n?`, 'm');

export interface InstallChecksOptions {
  target: string;
  hook: 'pre-commit' | 'pre-push' | 'both';
}

function findGitRoot(startPath: string): string {
  let dir = path.resolve(startPath);
  if (fs.existsSync(dir) && fs.statSync(dir).isFile()) {
    dir = path.dirname(dir);
  }

  while (true) {
    const gitPath = path.join(dir, '.git');
    if (fs.existsSync(gitPath)) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error('No .git directory found in current or parent directories');
    }
    dir = parent;
  }
}

function makeHookSnippet(repoRoot: string): string {
  return `${START_MARKER}\nREPO_ROOT="${repoRoot}"\nif command -v repotype >/dev/null 2>&1; then\n  repotype validate "$REPO_ROOT"\nelif command -v pnpm >/dev/null 2>&1; then\n  pnpm --silent exec repotype validate "$REPO_ROOT"\nelse\n  echo "repotype CLI not found. Install @supernal/repotype or add it to PATH."\n  exit 1\nfi\n${END_MARKER}\n`;
}

function upsertHook(hookFile: string, snippet: string): 'created' | 'updated' | 'unchanged' {
  const shebang = '#!/usr/bin/env bash\nset -euo pipefail\n\n';

  if (!fs.existsSync(hookFile)) {
    fs.writeFileSync(hookFile, `${shebang}${snippet}`);
    fs.chmodSync(hookFile, 0o755);
    return 'created';
  }

  let current = fs.readFileSync(hookFile, 'utf8');
  if (!current.startsWith('#!')) {
    current = `${shebang}${current}`;
  }

  if (MARKER_REGEX.test(current)) {
    const next = current.replace(MARKER_REGEX, snippet);
    if (next === current) {
      fs.chmodSync(hookFile, 0o755);
      return 'unchanged';
    }
    fs.writeFileSync(hookFile, next);
    fs.chmodSync(hookFile, 0o755);
    return 'updated';
  }

  const separator = current.endsWith('\n') ? '\n' : '\n\n';
  fs.writeFileSync(hookFile, `${current}${separator}${snippet}`);
  fs.chmodSync(hookFile, 0o755);
  return 'updated';
}

export function installChecks(options: InstallChecksOptions): {
  repoRoot: string;
  hooks: Array<{ hook: string; status: 'created' | 'updated' | 'unchanged'; path: string }>;
} {
  const repoRoot = findGitRoot(options.target);
  const hooksDir = path.join(repoRoot, '.git', 'hooks');

  if (!fs.existsSync(hooksDir)) {
    throw new Error(`Git hooks directory not found: ${hooksDir}`);
  }

  const hookNames = options.hook === 'both' ? ['pre-commit', 'pre-push'] : [options.hook];
  const snippet = makeHookSnippet(repoRoot);

  const hooks = hookNames.map((hook) => {
    const hookPath = path.join(hooksDir, hook);
    const status = upsertHook(hookPath, snippet);
    return { hook, status, path: hookPath };
  });

  return { repoRoot, hooks };
}

export function inspectChecks(target: string): {
  repoRoot: string;
  hooks: Array<{ hook: 'pre-commit' | 'pre-push'; path: string; exists: boolean; managed: boolean }>;
} {
  const repoRoot = findGitRoot(target);
  const hooksDir = path.join(repoRoot, '.git', 'hooks');
  const hookNames: Array<'pre-commit' | 'pre-push'> = ['pre-commit', 'pre-push'];

  const hooks = hookNames.map((hook) => {
    const hookPath = path.join(hooksDir, hook);
    if (!fs.existsSync(hookPath)) {
      return { hook, path: hookPath, exists: false, managed: false };
    }
    const content = fs.readFileSync(hookPath, 'utf8');
    return {
      hook,
      path: hookPath,
      exists: true,
      managed: MARKER_REGEX.test(content),
    };
  });

  return { repoRoot, hooks };
}

export function uninstallChecks(options: InstallChecksOptions): {
  repoRoot: string;
  hooks: Array<{ hook: string; status: 'removed' | 'unchanged' | 'not_found'; path: string }>;
} {
  const repoRoot = findGitRoot(options.target);
  const hooksDir = path.join(repoRoot, '.git', 'hooks');
  const hookNames = options.hook === 'both' ? ['pre-commit', 'pre-push'] : [options.hook];

  const hooks = hookNames.map((hook) => {
    const hookPath = path.join(hooksDir, hook);
    if (!fs.existsSync(hookPath)) {
      return { hook, status: 'not_found' as const, path: hookPath };
    }

    const current = fs.readFileSync(hookPath, 'utf8');
    if (!MARKER_REGEX.test(current)) {
      return { hook, status: 'unchanged' as const, path: hookPath };
    }

    const next = current.replace(MARKER_REGEX, '').trimEnd();
    fs.writeFileSync(hookPath, next.length > 0 ? `${next}\n` : '');
    fs.chmodSync(hookPath, 0o755);
    return { hook, status: 'removed' as const, path: hookPath };
  });

  return { repoRoot, hooks };
}
