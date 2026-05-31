import { statSync } from "node:fs";
import { basename, resolve, isAbsolute } from "node:path";
import { globby } from "globby";
import { parseMcpFile } from "@agent-audit/parser-mcp";
import { parseCodeFile, isCodeFile } from "@agent-audit/parser-code";
import { loadConfig } from "./config.js";
import {
  computeExitCode,
  filterByMinSeverity,
  runRules,
  summarize,
} from "./engine.js";
import type {
  AgentAuditConfig,
  CodeProject,
  McpProject,
  ScanOptions,
  ScanResult,
  ScanTarget,
} from "./types.js";
import {
  DEFAULT_CODE_GLOBS,
  DEFAULT_CODE_IGNORE,
  DEFAULT_EXCLUDES,
  DEFAULT_MCP_GLOBS,
  SCANNER_VERSION,
} from "./types.js";

export interface ScanOutput {
  result: ScanResult;
  exitCode: number;
}

function resolveTargets(
  options: ScanOptions,
  config: AgentAuditConfig,
): ScanTarget[] {
  return options.targets ?? config.targets ?? ["mcp", "code"];
}

function isMcpConfigFile(filePath: string): boolean {
  const name = basename(filePath);
  return (
    name === "mcp.json" ||
    name === "claude_desktop_config.json" ||
    filePath.replace(/\\/g, "/").endsWith(".cursor/mcp.json")
  );
}

export async function scan(options: ScanOptions = {}): Promise<ScanOutput> {
  const start = Date.now();
  const config =
    options.config ??
    loadConfig(options.configPath ?? ".agent-audit.yml");
  const failOn = options.failOn ?? config.severityThreshold ?? "error";
  const targets = resolveTargets(options, config);

  const inputPaths =
    options.paths ?? (options.path !== undefined ? [options.path] : ["."]);

  const { mcpFiles, codeFiles, pathError } = await discoverFiles(
    inputPaths,
    config,
    targets,
  );

  if (pathError) {
    return {
      result: {
        version: SCANNER_VERSION,
        findings: [],
        scannedFiles: [],
        durationMs: Date.now() - start,
        summary: { errors: 0, warnings: 0, info: 0 },
      },
      exitCode: 3,
    };
  }

  const rules = options.rules ?? [];
  if (rules.length === 0) {
    throw new Error("scan requires at least one rule; pass options.rules");
  }

  const projects: McpProject[] = [];
  const codeProjects: CodeProject[] = [];
  const parseErrors: Array<{ file: string; error: unknown }> = [];
  const scannedFiles = [...mcpFiles, ...codeFiles];

  for (const file of mcpFiles) {
    try {
      projects.push(parseMcpFile(file));
    } catch (error) {
      parseErrors.push({ file, error });
    }
  }

  for (const file of codeFiles) {
    try {
      codeProjects.push(parseCodeFile(file));
    } catch (error) {
      parseErrors.push({ file, error });
    }
  }

  if (config.failOnParseError && parseErrors.length > 0) {
    return {
      result: {
        version: SCANNER_VERSION,
        findings: [],
        scannedFiles,
        durationMs: Date.now() - start,
        summary: { errors: 0, warnings: 0, info: 0 },
      },
      exitCode: 3,
    };
  }

  const ctx = { projects, codeProjects, config };
  let findings = runRules(rules, ctx);
  findings = filterByMinSeverity(findings, options.minSeverity);

  const summary = summarize(findings);

  return {
    result: {
      version: SCANNER_VERSION,
      findings,
      scannedFiles,
      durationMs: Date.now() - start,
      summary,
    },
    exitCode: computeExitCode(summary, failOn),
  };
}

async function discoverFiles(
  inputPaths: string[],
  config: AgentAuditConfig,
  targets: ScanTarget[],
): Promise<{
  mcpFiles: string[];
  codeFiles: string[];
  pathError?: boolean;
}> {
  const cwd = process.cwd();
  const mcpFiles = new Set<string>();
  const codeFiles = new Set<string>();
  let pathsChecked = 0;
  let pathsFailed = 0;
  const scanMcp = targets.includes("mcp");
  const scanCode = targets.includes("code");

  for (const inputPath of inputPaths) {
    const absolute = isAbsolute(inputPath)
      ? inputPath
      : resolve(cwd, inputPath);

    pathsChecked++;

    try {
      const stats = statSync(absolute);
      if (stats.isFile()) {
        if (scanMcp && isMcpConfigFile(absolute)) mcpFiles.add(absolute);
        if (scanCode && isCodeFile(absolute)) codeFiles.add(absolute);
        continue;
      }

      const ignore = [...DEFAULT_EXCLUDES, ...(config.exclude ?? [])];

      if (scanMcp) {
        const mcpGlobs = [...DEFAULT_MCP_GLOBS, ...(config.include ?? [])];
        const found = await globby(mcpGlobs, {
          cwd: absolute,
          absolute: true,
          ignore,
          gitignore: true,
        });
        for (const file of found) mcpFiles.add(file);
      }

      if (scanCode) {
        const codeGlobs = [...DEFAULT_CODE_GLOBS, ...(config.include ?? [])];
        const codeIgnore = [...ignore, ...DEFAULT_CODE_IGNORE];
        const found = await globby(codeGlobs, {
          cwd: absolute,
          absolute: true,
          ignore: codeIgnore,
          gitignore: true,
        });
        for (const file of found) codeFiles.add(file);
      }
    } catch {
      pathsFailed++;
    }
  }

  if (pathsFailed > 0 && pathsFailed === pathsChecked) {
    return { mcpFiles: [], codeFiles: [], pathError: true };
  }

  return {
    mcpFiles: [...mcpFiles].sort(),
    codeFiles: [...codeFiles].sort(),
  };
}

export { loadConfig, INIT_CONFIG_TEMPLATE } from "./config.js";
export * from "./types.js";
export { computeExitCode, summarize, runRules } from "./engine.js";
