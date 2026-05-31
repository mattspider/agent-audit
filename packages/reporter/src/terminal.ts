import pc from "picocolors";
import type { Finding, ScanResult, Severity } from "@agent-audit/core";

function severityLabel(severity: Severity): string {
  switch (severity) {
    case "error":
      return pc.red(pc.bold("ERROR"));
    case "warning":
      return pc.yellow(pc.bold("WARNING"));
    case "info":
      return pc.blue(pc.bold("INFO"));
  }
}

function formatFinding(finding: Finding): string {
  const loc = finding.location.path
    ? `${finding.location.file} → ${finding.location.path}`
    : finding.location.file;

  const lines = [
    ` ${severityLabel(finding.severity)}  ${pc.cyan(finding.ruleId)}`,
    `        ${pc.dim(loc)}`,
    `        ${finding.message}`,
  ];

  if (finding.help) {
    lines.push(`        ${pc.green("→")} ${finding.help}`);
  }

  return lines.join("\n");
}

export function renderTerminal(result: ScanResult): string {
  const header = pc.bold(
    `agent-audit v${result.version} — scanned ${result.scannedFiles.length} file(s) in ${result.durationMs}ms`,
  );

  if (result.findings.length === 0) {
    return [
      header,
      "",
      pc.green("✓ No issues found"),
      "",
    ].join("\n");
  }

  const body = result.findings.map(formatFinding).join("\n\n");
  const footer = [
    "─".repeat(40),
    `  ${pc.red(String(result.summary.errors))} error · ${pc.yellow(String(result.summary.warnings))} warning · ${pc.blue(String(result.summary.info))} info`,
  ].join("\n");

  return [header, "", body, "", footer, ""].join("\n");
}
