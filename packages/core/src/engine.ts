import type { Finding, Rule, RuleContext, Severity } from "./types.js";

const SEVERITY_RANK: Record<Severity, number> = {
  info: 0,
  warning: 1,
  error: 2,
};

export function runRules(rules: Rule[], ctx: RuleContext): Finding[] {
  const findings: Finding[] = [];

  for (const rule of rules) {
    const override = ctx.config.rules?.[rule.id];
    if (override?.enabled === false) continue;
    if (ctx.config.ignore?.includes(rule.id)) continue;

    const ruleFindings = rule.run(ctx);
    for (const finding of ruleFindings) {
      const severity = override?.severity ?? finding.severity;
      findings.push({ ...finding, severity });
    }
  }

  return dedupeFindings(findings);
}

export function filterByMinSeverity(
  findings: Finding[],
  minSeverity?: Severity,
): Finding[] {
  if (!minSeverity) return findings;
  const minRank = SEVERITY_RANK[minSeverity];
  return findings.filter((f) => SEVERITY_RANK[f.severity] >= minRank);
}

export function summarize(findings: Finding[]) {
  return findings.reduce(
    (acc, f) => {
      acc[f.severity === "error" ? "errors" : f.severity === "warning" ? "warnings" : "info"]++;
      return acc;
    },
    { errors: 0, warnings: 0, info: 0 },
  );
}

export function computeExitCode(
  summary: ReturnType<typeof summarize>,
  failOn: Severity = "error",
): number {
  const failRank = SEVERITY_RANK[failOn];
  if (failRank <= SEVERITY_RANK.error && summary.errors > 0) return 2;
  if (failRank <= SEVERITY_RANK.warning && summary.warnings > 0) return 1;
  if (failRank <= SEVERITY_RANK.info && summary.info > 0) return 1;
  return 0;
}

function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.ruleId}|${f.location.file}|${f.location.path ?? ""}|${f.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export { SEVERITY_RANK };
