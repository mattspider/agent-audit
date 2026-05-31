import type { Rule } from "@agent-audit/core";
import { serverLocation } from "../helpers.js";

export const noAuth: Rule = {
  id: "mcp/no-auth",
  name: "Missing authentication",
  description: "Detects HTTP/SSE MCP servers without authentication headers.",
  severity: "warning",
  category: "auth",
  tags: ["mcp", "auth"],
  help: "Add Authorization or X-API-Key header, or reference via env",
  run(ctx) {
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        if (server.transport !== "http" && server.transport !== "sse") continue;

        const headers = server.headers ?? {};
        const hasAuth =
          "Authorization" in headers ||
          "authorization" in headers ||
          "X-API-Key" in headers ||
          "x-api-key" in headers;

        if (!hasAuth) {
          findings.push({
            ruleId: "mcp/no-auth",
            severity: "warning" as const,
            message: `HTTP/SSE server "${server.name}" has no authentication headers`,
            help: "Add Authorization or X-API-Key header, or reference via env",
            location: serverLocation(project.source.path, server.name),
          });
        }
      }
    }

    return findings;
  },
};
