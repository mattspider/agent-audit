import type { Rule } from "@agent-audit/core";
import { codeLocation, getRuleOptions } from "../helpers.js";

export const tooManyTools: Rule = {
  id: "code/too-many-tools",
  name: "Too many tools in file",
  description: "Flags source files that define an unusually large number of agent tools.",
  severity: "info",
  category: "config",
  tags: ["code", "config"],
  help: "Split tools by domain and apply least-privilege per tool",
  run(ctx) {
    const { maxTools = 15 } = getRuleOptions(ctx, "code/too-many-tools", {
      maxTools: 15,
    });

    const findings = [];

    for (const project of ctx.codeProjects) {
      if (project.tools.length > maxTools) {
        findings.push({
          ruleId: "code/too-many-tools",
          severity: "info" as const,
          message: `File defines ${project.tools.length} tools (max recommended: ${maxTools})`,
          help: "Split tools by domain and apply least-privilege per tool",
          location: codeLocation(project.source.path, 1),
        });
      }
    }

    return findings;
  },
};
