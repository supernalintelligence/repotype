import type { DiagnosticSeverity } from '../core/types.js';

export interface ReportCodeSummary {
  code: string;
  severity: DiagnosticSeverity;
  count: number;
}

export interface ReportFinding {
  code: string;
  severity: DiagnosticSeverity;
  file: string;
  message: string;
}

export interface ComplianceReport {
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

export type ComplianceReportFormat = 'markdown' | 'json' | 'html';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function parseComplianceReportJson(json: string): ComplianceReport {
  return JSON.parse(json) as ComplianceReport;
}

export function renderMarkdownComplianceReport(report: ComplianceReport): string {
  const lines: string[] = [];
  lines.push('# Repotype Compliance Report');
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Target: ${report.target}`);
  lines.push(`- Repo root: ${report.repoRoot}`);
  lines.push(`- Config: ${report.configPath}`);
  lines.push(`- Status: ${report.ok ? 'PASS' : 'FAIL'}`);
  lines.push(`- Files scanned: ${report.filesScanned}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Severity | Count |');
  lines.push('| --- | ---: |');
  lines.push(`| error | ${report.totals.errors} |`);
  lines.push(`| warning | ${report.totals.warnings} |`);
  lines.push(`| suggestion | ${report.totals.suggestions} |`);
  lines.push(`| total diagnostics | ${report.totals.diagnostics} |`);
  lines.push('');
  lines.push('## Diagnostics By Code');
  lines.push('');
  lines.push('| Code | Severity | Count |');
  lines.push('| --- | --- | ---: |');
  for (const code of report.byCode) {
    lines.push(`| ${code.code} | ${code.severity} | ${code.count} |`);
  }
  lines.push('');
  lines.push('## Sample Findings');
  lines.push('');
  if (report.sampleFindings.length === 0) {
    lines.push('- No findings.');
  } else {
    for (const finding of report.sampleFindings) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.message} (${finding.file})`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

export function renderHtmlComplianceReport(report: ComplianceReport): string {
  const byCodeRows = report.byCode
    .map(
      (item) =>
        `<tr><td><code>${escapeHtml(item.code)}</code></td><td>${escapeHtml(item.severity)}</td><td class="num">${item.count}</td></tr>`,
    )
    .join('\n');
  const sampleRows =
    report.sampleFindings.length === 0
      ? '<tr><td colspan="4">No findings.</td></tr>'
      : report.sampleFindings
          .map(
            (item) =>
              `<tr><td>${escapeHtml(item.severity)}</td><td><code>${escapeHtml(item.code)}</code></td><td>${escapeHtml(item.message)}</td><td><code>${escapeHtml(item.file)}</code></td></tr>`,
          )
          .join('\n');

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
  <p><span class="badge">Status: ${report.ok ? 'PASS' : 'FAIL'}</span></p>

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

export function renderComplianceReport(
  report: ComplianceReport,
  format: ComplianceReportFormat = 'markdown',
): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  if (format === 'html') {
    return renderHtmlComplianceReport(report);
  }
  return renderMarkdownComplianceReport(report);
}

export function renderComplianceReportFromJson(
  json: string,
  format: ComplianceReportFormat = 'html',
): string {
  return renderComplianceReport(parseComplianceReportJson(json), format);
}
