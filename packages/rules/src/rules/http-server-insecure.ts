import type { Rule } from "@agent-audit/core";
import { serverLocation } from "../helpers.js";

export const httpServerInsecure: Rule = {
  id: "mcp/http-server-insecure",
  name: "Insecure HTTP server",
  description: "Detects MCP servers using unencrypted http:// URLs.",
  severity: "warning",
  category: "auth",
  tags: ["mcp", "http", "tls"],
  help: "Use HTTPS or restrict to localhost with documented justification",
  run(ctx) {
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        if (server.url?.startsWith("http://")) {
          findings.push({
            ruleId: "mcp/http-server-insecure",
            severity: "warning" as const,
            message: `Server "${server.name}" uses insecure HTTP URL: ${server.url}`,
            help: "Use HTTPS or restrict to localhost with documented justification",
            location: serverLocation(project.source.path, server.name, ".url"),
          });
        }
      }
    }

    return findings;
  },
};
