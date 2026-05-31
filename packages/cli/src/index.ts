import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import { scan, INIT_CONFIG_TEMPLATE, type ScanTarget, type Severity } from "@agent-audit/core";
import { render, type OutputFormat } from "@agent-audit/reporter";
import { builtinRules, codeRules, getRuleById, mcpRules } from "@agent-audit/rules";

const VERSION = "0.2.0";

const program = new Command();

program
  .name("agent-audit")
  .description("Static security audit for MCP configs and agent tool code")
  .version(VERSION);

program
  .command("scan")
  .description("Scan MCP configs and/or agent tool definitions for security issues")
  .argument(
    "[paths...]",
    "Files or directories to scan recursively (default: current directory)",
  )
  .option("--format <format>", "Output format: terminal, json, sarif", "terminal")
  .option("--config <path>", "Path to .agent-audit.yml", ".agent-audit.yml")
  .option("--severity <level>", "Minimum severity to report: error, warning, info")
  .option("--fail-on <level>", "Exit non-zero on severity: error, warning, info", "error")
  .option("--mcp-only", "Scan MCP config files only")
  .option("--code-only", "Scan TypeScript/Python tool definitions only")
  .action(async (paths: string[], options) => {
    const configPath = resolve(process.cwd(), options.config);
    const format = options.format as OutputFormat;
    const minSeverity = options.severity as Severity | undefined;
    const failOn = options.failOn as Severity;
    const scanPaths = paths.length > 0 ? paths : ["."];

    let targets: ScanTarget[] | undefined;
    if (options.mcpOnly && options.codeOnly) {
      console.error("Error: use only one of --mcp-only or --code-only");
      process.exit(3);
    }
    if (options.mcpOnly) targets = ["mcp"];
    if (options.codeOnly) targets = ["code"];

    let rules = builtinRules;
    if (options.mcpOnly) rules = mcpRules;
    if (options.codeOnly) rules = codeRules;

    const { result, exitCode } = await scan({
      paths: scanPaths,
      configPath: existsSync(configPath) ? configPath : undefined,
      minSeverity,
      failOn,
      targets,
      rules,
    });

    process.stdout.write(render(result, format));
    if (format === "terminal" && !process.stdout.isTTY) {
      process.stdout.write("\n");
    }

    process.exit(exitCode);
  });

program
  .command("init")
  .description("Create a .agent-audit.yml configuration file")
  .option("--force", "Overwrite existing config")
  .action((options) => {
    const target = resolve(process.cwd(), ".agent-audit.yml");
    if (existsSync(target) && !options.force) {
      console.error("Error: .agent-audit.yml already exists (use --force to overwrite)");
      process.exit(3);
    }
    writeFileSync(target, INIT_CONFIG_TEMPLATE, "utf8");
    console.log("Created .agent-audit.yml");
  });

const rulesCmd = program.command("rules").description("Manage audit rules");

rulesCmd
  .command("list")
  .description("List built-in rules")
  .action(() => {
    for (const rule of builtinRules) {
      console.log(`${rule.id}  [${rule.severity}]  ${rule.name}`);
    }
  });

rulesCmd
  .command("explain")
  .description("Explain a rule by ID")
  .argument("<ruleId>", "Rule ID, e.g. mcp/broad-filesystem")
  .action((ruleId: string) => {
    const rule = getRuleById(ruleId);
    if (!rule) {
      console.error(`Unknown rule: ${ruleId}`);
      process.exit(3);
    }
    console.log(`${rule.id} — ${rule.name}`);
    console.log(`Severity: ${rule.severity}`);
    console.log(`Category: ${rule.category}`);
    console.log(`\n${rule.description}\n`);
    console.log(`Remediation: ${rule.help}`);
  });

program.parse();
