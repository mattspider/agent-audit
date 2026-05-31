export type Severity = "error" | "warning" | "info";

export type ScanTarget = "mcp" | "code";

export type CodeLanguage = "typescript" | "python";

export type CodeFramework =
  | "vercel-ai"
  | "openai"
  | "langchain"
  | "generic";

export interface CodeLiteral {
  value: string;
  line: number;
}

export interface CodeTool {
  name: string;
  description?: string;
  file: string;
  line: number;
  framework: CodeFramework;
  executeSnippet?: string;
  literals: CodeLiteral[];
}

export interface CodeProject {
  source: {
    path: string;
    language: CodeLanguage;
  };
  tools: CodeTool[];
}

export type ConfigFormat = "cursor" | "claude-desktop" | "generic";

export interface SourceFile {
  path: string;
  format: ConfigFormat;
}

export interface McpProject {
  source: SourceFile;
  servers: McpServer[];
}

export interface McpServer {
  name: string;
  transport: "stdio" | "sse" | "http";
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  headers?: Record<string, string>;
  tools?: McpTool[];
  raw: unknown;
}

export interface McpTool {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  help?: string;
  location: {
    file: string;
    path?: string;
    line?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface ScanResult {
  version: string;
  findings: Finding[];
  scannedFiles: string[];
  durationMs: number;
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export interface RuleOverride {
  enabled?: boolean;
  severity?: Severity;
  options?: Record<string, unknown>;
}

export interface AgentAuditConfig {
  include?: string[];
  exclude?: string[];
  ignore?: string[];
  severityThreshold?: Severity;
  failOnParseError?: boolean;
  targets?: ScanTarget[];
  rules?: Record<string, RuleOverride>;
}

export interface RuleContext {
  projects: McpProject[];
  codeProjects: CodeProject[];
  config: AgentAuditConfig;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  category: "auth" | "permissions" | "secrets" | "config";
  tags: string[];
  help: string;
  run: (ctx: RuleContext) => Finding[];
}

export interface ScanOptions {
  path?: string;
  paths?: string[];
  config?: AgentAuditConfig;
  configPath?: string;
  rules?: Rule[];
  minSeverity?: Severity;
  failOn?: Severity;
  targets?: ScanTarget[];
}

export const SCANNER_VERSION = "0.2.0";

export const DEFAULT_MCP_GLOBS = [
  "**/mcp.json",
  "**/.cursor/mcp.json",
  "**/claude_desktop_config.json",
];

/** @deprecated use DEFAULT_MCP_GLOBS */
export const DEFAULT_GLOBS = DEFAULT_MCP_GLOBS;

export const DEFAULT_CODE_GLOBS = ["**/*.{ts,tsx}", "**/*.py"];

export const DEFAULT_CODE_IGNORE = [
  "**/*.d.ts",
  "**/*.test.ts",
  "**/*.spec.ts",
  "**/node_modules/**",
  "**/dist/**",
  "**/.git/**",
];

export const DEFAULT_EXCLUDES = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.git/**",
];
