import type { Rule } from "@agent-audit/core";
import { codeLocation, SECRET_PATTERNS } from "../helpers.js";

export const secretInCode: Rule = {
  id: "code/secret-in-tool",
  name: "Secret in tool definition",
  description:
    "Detects hardcoded secrets in tool definitions or execute handlers.",
  severity: "error",
  category: "secrets",
  tags: ["code", "secrets"],
  help: "Load secrets from environment variables at runtime, not from source code",
  run(ctx) {
    const findings = [];

    for (const project of ctx.codeProjects) {
      for (const tool of project.tools) {
        const haystacks = [
          tool.executeSnippet ?? "",
          ...tool.literals.map((literal) => literal.value),
        ];

        for (const haystack of haystacks) {
          for (const pattern of SECRET_PATTERNS) {
            if (pattern.test(haystack)) {
              findings.push({
                ruleId: "code/secret-in-tool",
                severity: "error" as const,
                message: `Tool "${tool.name}" contains a potential hardcoded secret`,
                help:
                  "Load secrets from environment variables at runtime, not from source code",
                location: codeLocation(tool.file, tool.line, tool.name),
              });
              break;
            }
          }
        }
      }
    }

    return findings;
  },
};
