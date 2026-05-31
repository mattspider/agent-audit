import { readFileSync, existsSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { AgentAuditConfig } from "./types.js";

const DEFAULT_CONFIG: AgentAuditConfig = {
  severityThreshold: "error",
  failOnParseError: false,
  exclude: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
};

export function loadConfig(configPath?: string): AgentAuditConfig {
  if (!configPath || !existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  const raw = readFileSync(configPath, "utf8");
  const parsed = parseYaml(raw) as AgentAuditConfig | null;

  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    exclude: [...(DEFAULT_CONFIG.exclude ?? []), ...(parsed?.exclude ?? [])],
  };
}

export const INIT_CONFIG_TEMPLATE = `# agent-audit configuration
severityThreshold: error
failOnParseError: true

# Scan targets: mcp configs and/or code tool definitions
targets:
  - mcp
  - code

exclude:
  - "node_modules/**"
  - "dist/**"

# ignore:
#   - "mcp/unknown-server"

# rules:
#   "mcp/broad-filesystem":
#     severity: error
#     options:
#       allowedPaths: ["./", "/workspace"]
`;
