import type { Rule } from "@agent-audit/core";
import { isDatabaseServer, joinCommand, serverLocation } from "../helpers.js";

const RESTRICTION_FLAGS = ["--read-only", "--schema", "--database", "-d", "--db"];

export const unrestrictedDatabase: Rule = {
  id: "mcp/unrestricted-database",
  name: "Unrestricted database access",
  description: "Detects database MCP servers without schema or read-only restrictions.",
  severity: "error",
  category: "permissions",
  tags: ["mcp", "database"],
  help: "Pass read-only flag, specific database name, or schema restriction in server args",
  run(ctx) {
    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        if (!isDatabaseServer(server)) continue;

        const joined = joinCommand(server);
        const hasRestriction = RESTRICTION_FLAGS.some((flag) => joined.includes(flag));

        if (!hasRestriction) {
          findings.push({
            ruleId: "mcp/unrestricted-database",
            severity: "error" as const,
            message: `Database server "${server.name}" has no read-only or schema restriction`,
            help: "Pass read-only flag, specific database name, or schema restriction in server args",
            location: serverLocation(project.source.path, server.name),
          });
        }
      }
    }

    return findings;
  },
};
