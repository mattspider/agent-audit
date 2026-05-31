import type { McpProject, McpServer } from "./types.js";
import type { RawMcpConfig } from "./schema.js";
import { detectFormat } from "./detect.js";

function inferTransport(server: RawMcpConfig["mcpServers"][string]): McpServer["transport"] {
  if (server.url) {
    const type = server.type?.toLowerCase();
    if (type === "sse" || server.url.includes("sse")) {
      return "sse";
    }
    return "http";
  }
  return "stdio";
}

export function normalizeMcpProject(
  filePath: string,
  raw: RawMcpConfig,
): McpProject {
  const format = detectFormat(filePath, raw);

  const servers: McpServer[] = Object.entries(raw.mcpServers).map(
    ([name, server]) => ({
      name,
      transport: inferTransport(server),
      command: server.command,
      args: server.args,
      url: server.url,
      env: server.env,
      headers: server.headers,
      raw: server,
    }),
  );

  return {
    source: { path: filePath, format },
    servers,
  };
}
