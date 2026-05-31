import type { Rule } from "@agent-audit/core";
import { codeLocation, DESTRUCTIVE_TOOL_NAME } from "../helpers.js";

export const destructiveToolName: Rule = {
  id: "code/destructive-tool-name",
  name: "Destructive tool name",
  description:
    "Detects agent tools with names that imply destructive or high-risk actions.",
  severity: "error",
  category: "permissions",
  tags: ["code", "tools"],
  help:
    "Use non-destructive names, require explicit confirmation, and restrict permissions",
  run(ctx) {
    const findings = [];

    for (const project of ctx.codeProjects) {
      for (const tool of project.tools) {
        if (DESTRUCTIVE_TOOL_NAME.test(tool.name)) {
          findings.push({
            ruleId: "code/destructive-tool-name",
            severity: "error" as const,
            message: `Tool "${tool.name}" has a destructive or high-risk name`,
            help:
              "Use non-destructive names, require explicit confirmation, and restrict permissions",
            location: codeLocation(tool.file, tool.line, tool.name),
          });
        }
      }
    }

    return findings;
  },
};
