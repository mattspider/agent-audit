import { describe, expect, it } from "vitest";
import { parseMcpFile } from "@agent-audit/parser-mcp";
import { runRules } from "@agent-audit/core";
import { broadFilesystem, secretInConfig, dangerousCommand } from "@agent-audit/rules";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

describe("rules", () => {
  it("detects broad filesystem", () => {
    const project = parseMcpFile(resolve(root, "examples/insecure/mcp.json"));
    const findings = runRules([broadFilesystem], {
      projects: [project],
      codeProjects: [],
      config: {},
    });
    expect(findings.some((f) => f.ruleId === "mcp/broad-filesystem")).toBe(true);
  });

  it("detects dangerous command", () => {
    const project = parseMcpFile(resolve(root, "examples/insecure/mcp.json"));
    const findings = runRules([dangerousCommand], {
      projects: [project],
      codeProjects: [],
      config: {},
    });
    expect(findings.some((f) => f.ruleId === "mcp/dangerous-command")).toBe(true);
  });

  it("detects secrets in cursor config", () => {
    const project = parseMcpFile(
      resolve(root, "examples/insecure/.cursor/mcp.json"),
    );
    const findings = runRules([secretInConfig, broadFilesystem], {
      projects: [project],
      codeProjects: [],
      config: {},
    });
    expect(
      findings.some(
        (f) =>
          f.ruleId === "mcp/env-secrets" || f.ruleId === "mcp/secret-in-config",
      ),
    ).toBe(true);
  });

  it("returns no errors for secure config with strict rules", () => {
    const project = parseMcpFile(resolve(root, "examples/secure/mcp.json"));
    const findings = runRules(
      [broadFilesystem, secretInConfig, dangerousCommand],
      { projects: [project], codeProjects: [], config: {} },
    );
    expect(findings.filter((f) => f.severity === "error")).toHaveLength(0);
  });
});
