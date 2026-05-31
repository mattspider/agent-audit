import { readFileSync } from "node:fs";
import type { McpProject } from "./types.js";
import { mcpConfigSchema } from "./schema.js";
import { parseRawConfig } from "./detect.js";
import { normalizeMcpProject } from "./normalize.js";

export function parseMcpFile(filePath: string): McpProject {
  const content = readFileSync(filePath, "utf8");
  let json: unknown;

  try {
    json = JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse JSON: ${filePath}`);
  }

  const raw = parseRawConfig(json);
  mcpConfigSchema.parse(raw);

  return normalizeMcpProject(filePath, raw);
}

export { detectFormat } from "./detect.js";
export { normalizeMcpProject } from "./normalize.js";
