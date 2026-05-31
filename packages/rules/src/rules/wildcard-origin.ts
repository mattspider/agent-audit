import type { Rule } from "@agent-audit/core";
import { serverLocation } from "../helpers.js";

export const wildcardOrigin: Rule = {
  id: "mcp/wildcard-origin",
  name: "Wildcard origin",
  description: "Detects wildcard CORS or origin settings in MCP config.",
  severity: "warning",
  category: "config",
  tags: ["mcp", "cors"],
  help: "Restrict allowed origins explicitly instead of using wildcard",
  run(ctx) {
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        const raw = JSON.stringify(server.raw);
        if (
          raw.includes('"*"') &&
          /origin|cors|allowed/i.test(raw)
        ) {
          findings.push({
            ruleId: "mcp/wildcard-origin",
            severity: "warning" as const,
            message: `Server "${server.name}" may allow wildcard origin/CORS`,
            help: "Restrict allowed origins explicitly instead of using wildcard",
            location: serverLocation(project.source.path, server.name),
          });
        }
      }
    }

    return findings;
  },
};
