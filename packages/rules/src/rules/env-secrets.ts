import type { Rule } from "@agent-audit/core";
import { SENSITIVE_ENV_KEY, serverLocation } from "../helpers.js";

export const envSecrets: Rule = {
  id: "mcp/env-secrets",
  name: "Secrets in env block",
  description:
    "Detects sensitive environment variable values inline in MCP config.",
  severity: "warning",
  category: "secrets",
  tags: ["mcp", "secrets", "env"],
  help: "Reference env var names only; values should come from the runtime environment",
  run(ctx) {
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        if (!server.env) continue;

        for (const [key, value] of Object.entries(server.env)) {
          const looksSensitive = SENSITIVE_ENV_KEY.test(key);
          const hasInlineValue = value.length > 0 && !/^\$\{?[A-Z_][A-Z0-9_]*\}?$/.test(value);

          if (looksSensitive && hasInlineValue) {
            findings.push({
              ruleId: "mcp/env-secrets",
              severity: "warning" as const,
              message: `Sensitive env var "${key}" has inline value in server "${server.name}"`,
              help: "Reference env var names only; values should come from the runtime environment",
              location: serverLocation(project.source.path, server.name, `.env.${key}`),
            });
          }
        }
      }
    }

    return findings;
  },
};
