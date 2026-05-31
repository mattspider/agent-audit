import type { Rule } from "@agent-audit/core";
import { getRuleOptions, joinCommand, KNOWN_PACKAGES, serverLocation } from "../helpers.js";

export const unknownServer: Rule = {
  id: "mcp/unknown-server",
  name: "Unknown MCP server package",
  description: "Flags MCP server commands not in the built-in allowlist.",
  severity: "info",
  category: "config",
  tags: ["mcp", "supply-chain"],
  help: "Verify package origin; add trusted packages to allowlist in .agent-audit.yml",
  run(ctx) {
    const { allowlist = [] } = getRuleOptions(ctx, "mcp/unknown-server", {
      allowlist: [] as string[],
    });

    const trusted = [...KNOWN_PACKAGES, ...allowlist];
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        const joined = joinCommand(server);
        const isKnown = trusted.some((pkg) => joined.includes(pkg));

        if (!isKnown && joined.length > 0) {
          findings.push({
            ruleId: "mcp/unknown-server",
            severity: "info" as const,
            message: `Unknown MCP server command for "${server.name}": ${joined}`,
            help: "Verify package origin; add trusted packages to allowlist in .agent-audit.yml",
            location: serverLocation(project.source.path, server.name),
          });
        }
      }
    }

    return findings;
  },
};
