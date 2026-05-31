import { basename, normalize } from "node:path";
import type { ConfigFormat } from "./types.js";
import type { RawMcpConfig } from "./schema.js";

export function detectFormat(filePath: string, raw: unknown): ConfigFormat {
  const normalized = normalize(filePath).replace(/\\/g, "/");

  if (normalized.endsWith(".cursor/mcp.json")) {
    return "cursor";
  }

  if (basename(filePath) === "claude_desktop_config.json") {
    return "claude-desktop";
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    "mcpServers" in raw
  ) {
    return "generic";
  }

  return "generic";
}

export function parseRawConfig(raw: unknown): RawMcpConfig {
  if (typeof raw !== "object" || raw === null || !("mcpServers" in raw)) {
    throw new Error("Invalid MCP config: missing mcpServers");
  }
  return raw as RawMcpConfig;
}
