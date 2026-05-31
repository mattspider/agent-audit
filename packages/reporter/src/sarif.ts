import type { Finding, ScanResult, Severity } from "@agent-audit/core";

function sarifLevel(severity: Severity): string {
  switch (severity) {
    case "error":
      return "error";
    case "warning":
      return "warning";
    case "info":
      return "note";
  }
}

export function renderSarif(result: ScanResult): string {
  const ruleIds = [...new Set(result.findings.map((f) => f.ruleId))];

  const sarif = {
    $schema:
      "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "agent-audit",
            version: result.version,
            informationUri: "https://github.com/agent-audit/agent-audit",
            rules: ruleIds.map((id) => ({
              id,
              name: id,
              shortDescription: { text: id },
            })),
          },
        },
        results: result.findings.map((finding: Finding) => ({
          ruleId: finding.ruleId,
          level: sarifLevel(finding.severity),
          message: { text: finding.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: finding.location.file },
              },
            },
          ],
        })),
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
