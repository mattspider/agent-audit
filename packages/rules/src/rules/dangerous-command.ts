import type { Rule } from "@agent-audit/core";
import { DANGEROUS_PATTERNS, joinCommand, serverLocation } from "../helpers.js";

export const dangerousCommand: Rule = {
  id: "mcp/dangerous-command",
  name: "Dangerous command",
  description: "Detects destructive shell commands in MCP server definitions.",
  severity: "error",
  category: "permissions",
  tags: ["mcp", "command"],
  help: "Remove destructive commands; use dedicated MCP servers instead",
  run(ctx) {
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        const joined = joinCommand(server);
        for (const pattern of DANGEROUS_PATTERNS) {
          if (pattern.test(joined)) {
            findings.push({
              ruleId: "mcp/dangerous-command",
              severity: "error" as const,
              message: `Dangerous command pattern in server "${server.name}": ${joined}`,
              help: "Remove destructive commands; use dedicated MCP servers instead",
              location: serverLocation(project.source.path, server.name),
            });
            break;
          }
        }
      }
    }

    return findings;
  },
};
