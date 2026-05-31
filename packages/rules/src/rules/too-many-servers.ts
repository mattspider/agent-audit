import type { Rule } from "@agent-audit/core";
import { getRuleOptions } from "../helpers.js";

export const tooManyServers: Rule = {
  id: "mcp/too-many-servers",
  name: "Too many MCP servers",
  description: "Flags configs with an unusually large number of MCP servers.",
  severity: "info",
  category: "config",
  tags: ["mcp", "config"],
  help: "Reduce attack surface by consolidating MCP servers",
  run(ctx) {
    const { maxServers = 10 } = getRuleOptions(ctx, "mcp/too-many-servers", {
      maxServers: 10,
    });

    const findings = [];

    for (const project of ctx.projects) {
      if (project.servers.length > maxServers) {
        findings.push({
          ruleId: "mcp/too-many-servers",
          severity: "info" as const,
          message: `Config has ${project.servers.length} MCP servers (max recommended: ${maxServers})`,
          help: "Reduce attack surface by consolidating MCP servers",
          location: {
            file: project.source.path,
            path: "$.mcpServers",
          },
        });
      }
    }

    return findings;
  },
};
