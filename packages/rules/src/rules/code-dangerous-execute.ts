import type { Rule } from "@agent-audit/core";
import { codeLocation, DANGEROUS_PATTERNS } from "../helpers.js";

export const dangerousExecute: Rule = {
  id: "code/dangerous-execute",
  name: "Dangerous execute handler",
  description:
    "Detects dangerous shell or filesystem operations inside tool execute handlers.",
  severity: "error",
  category: "permissions",
  tags: ["code", "tools"],
  help: "Remove destructive operations from tool handlers; use scoped APIs instead",
  run(ctx) {
    const findings = [];

    for (const project of ctx.codeProjects) {
      for (const tool of project.tools) {
        if (!tool.executeSnippet) continue;

        for (const pattern of DANGEROUS_PATTERNS) {
          if (pattern.test(tool.executeSnippet)) {
            findings.push({
              ruleId: "code/dangerous-execute",
              severity: "error" as const,
              message: `Tool "${tool.name}" execute handler contains dangerous operation`,
              help:
                "Remove destructive operations from tool handlers; use scoped APIs instead",
              location: codeLocation(tool.file, tool.line, tool.name),
            });
            break;
          }
        }
      }
    }

    return findings;
  },
};
