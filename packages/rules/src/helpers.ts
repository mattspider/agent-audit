import type { Finding, McpServer } from "@agent-audit/core";

export function serverLocation(
  file: string,
  serverName: string,
  suffix = "",
): Finding["location"] {
  return {
    file,
    path: `$.mcpServers.${serverName}${suffix}`,
  };
}

export function joinCommand(server: McpServer): string {
  return [server.command, ...(server.args ?? [])].filter(Boolean).join(" ");
}

export function isFilesystemServer(server: McpServer): boolean {
  const joined = joinCommand(server).toLowerCase();
  return (
    joined.includes("server-filesystem") ||
    joined.includes("filesystem")
  );
}

export function isDatabaseServer(server: McpServer): boolean {
  const joined = joinCommand(server).toLowerCase();
  return (
    joined.includes("postgres") ||
    joined.includes("sqlite") ||
    joined.includes("mysql") ||
    joined.includes("mcp-server-postgres")
  );
}

export function codeLocation(
  file: string,
  line: number,
  symbol?: string,
): Finding["location"] {
  return {
    file,
    line,
    path: symbol,
  };
}

export const DESTRUCTIVE_TOOL_NAME =
  /^(?:delete|remove|drop|wipe|truncate|destroy|purge|kill|shutdown|exec|eval)/i;

export const FILE_SYSTEM_PATTERNS = [
  /readFile(?:Sync)?\s*\(/,
  /writeFile(?:Sync)?\s*\(/,
  /fs\.(?:read|write|unlink|rmdir|rm)/,
  /open\s*\(\s*["'`]/,
];

export function getRuleOptions<T>(
  ctx: { config: { rules?: Record<string, { options?: Record<string, unknown> }> } },
  ruleId: string,
  defaults: T,
): T {
  const options = ctx.config.rules?.[ruleId]?.options ?? {};
  return { ...defaults, ...options } as T;
}

export const KNOWN_PACKAGES = [
  "@modelcontextprotocol/server-filesystem",
  "@modelcontextprotocol/server-github",
  "@modelcontextprotocol/server-gitlab",
  "@modelcontextprotocol/server-slack",
  "@modelcontextprotocol/server-puppeteer",
  "mcp-server-postgres",
  "mcp-server-sqlite",
  "@playwright/mcp",
  "npx",
  "node",
  "uvx",
  "uv",
  "docker",
];

export const SECRET_PATTERNS = [
  /\bsk-[a-zA-Z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bghp_[a-zA-Z0-9]{36,}\b/,
  /\bgho_[a-zA-Z0-9]{36,}\b/,
  /\bxox[baprs]-[a-zA-Z0-9-]{10,}\b/,
  /\bBearer\s+[a-zA-Z0-9._-]{20,}\b/i,
  /\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/,
  /"(?:password|secret|api[_-]?key)"\s*:\s*"[^"$]{8,}"/i,
];

export const DANGEROUS_PATTERNS = [
  /rm\s+-rf/i,
  /curl\s+[^|]*\|\s*(?:ba)?sh/i,
  /wget\s+[^|]*\|\s*(?:ba)?sh/i,
  /chmod\s+777/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
];

export const SENSITIVE_ENV_KEY = /(?:^|_)(?:KEY|TOKEN|SECRET|PASSWORD)(?:$|_)/i;
