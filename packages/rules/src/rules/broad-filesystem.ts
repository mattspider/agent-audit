import type { Rule } from "@agent-audit/core";
import {
  getRuleOptions,
  isFilesystemServer,
  serverLocation,
} from "../helpers.js";

const HOME_PATTERNS = [
  /^\/$/,
  /^~$/,
  /^\/Users\/[^/]+$/,
  /^\/home\/[^/]+$/,
  /^C:\\Users\\[^\\]+$/i,
];

export const broadFilesystem: Rule = {
  id: "mcp/broad-filesystem",
  name: "Broad filesystem access",
  description:
    "Detects MCP filesystem servers with access to root, home, or overly broad paths.",
  severity: "error",
  category: "permissions",
  tags: ["mcp", "filesystem"],
  help: "Restrict to project directory: ./ or /workspace",
  run(ctx) {
    const { allowedPaths = [] } = getRuleOptions(ctx, "mcp/broad-filesystem", {
      allowedPaths: [] as string[],
    });

    const findings = [];

    for (const project of ctx.projects) {
      for (const server of project.servers) {
        if (!isFilesystemServer(server)) continue;

        const paths = (server.args ?? []).filter(
          (arg) => !arg.startsWith("-") && !arg.includes("server-filesystem"),
        );

        for (const path of paths) {
          const isAllowed = allowedPaths.some(
            (allowed) => path === allowed || path.startsWith(allowed),
          );
          if (isAllowed) continue;

          const isBroad = HOME_PATTERNS.some((p) => p.test(path));
          if (isBroad) {
            findings.push({
              ruleId: "mcp/broad-filesystem",
              severity: "error" as const,
              message: `Filesystem server has broad access path: ${path}`,
              help: "Restrict to project directory: ./ or /workspace",
              location: serverLocation(project.source.path, server.name),
              metadata: { path },
            });
          }
        }
      }
    }

    return findings;
  },
};
