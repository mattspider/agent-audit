export type ConfigFormat = "cursor" | "claude-desktop" | "generic";

export interface SourceFile {
  path: string;
  format: ConfigFormat;
}

export interface McpServer {
  name: string;
  transport: "stdio" | "sse" | "http";
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  headers?: Record<string, string>;
  raw: unknown;
}

export interface McpProject {
  source: SourceFile;
  servers: McpServer[];
}
