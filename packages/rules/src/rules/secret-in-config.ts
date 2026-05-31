import type { Rule } from "@agent-audit/core";
import { SECRET_PATTERNS, serverLocation } from "../helpers.js";

export const secretInConfig: Rule = {
  id: "mcp/secret-in-config",
  name: "Secret in config",
  description: "Detects hardcoded API keys, tokens, and secrets in MCP config.",
  severity: "error",
  category: "secrets",
  tags: ["mcp", "secrets"],
  help: "Move secrets to environment variables referenced via env field",
  run(ctx) {
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        const raw = JSON.stringify(server.raw);
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(raw)) {
            findings.push({
              ruleId: "mcp/secret-in-config",
              severity: "error" as const,
              message: `Potential hardcoded secret in server "${server.name}"`,
              help: "Move secrets to environment variables referenced via env field",
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
