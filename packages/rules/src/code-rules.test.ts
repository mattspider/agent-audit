import { describe, expect, it } from "vitest";
import { parseCodeFile } from "@agent-audit/parser-code";
import { runRules } from "@agent-audit/core";
import {
  destructiveToolName,
  dangerousExecute,
  secretInCode,
  unrestrictedFileAccess,
} from "@agent-audit/rules";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

describe("code rules", () => {
  it("detects destructive tool names", () => {
    const project = parseCodeFile(
      resolve(root, "examples/code/insecure/agent.ts"),
    );
    const findings = runRules([destructiveToolName], {
      projects: [],
      codeProjects: [project],
      config: {},
    });
    expect(findings.some((f) => f.ruleId === "code/destructive-tool-name")).toBe(
      true,
    );
  });

  it("detects dangerous execute handlers", () => {
    const project = parseCodeFile(
      resolve(root, "examples/code/insecure/agent.ts"),
    );
    const findings = runRules([dangerousExecute], {
      projects: [],
      codeProjects: [project],
      config: {},
    });
    expect(findings.some((f) => f.ruleId === "code/dangerous-execute")).toBe(true);
  });

  it("detects secrets in tools", () => {
    const project = parseCodeFile(
      resolve(root, "examples/code/insecure/agent.ts"),
    );
    const findings = runRules([secretInCode], {
      projects: [],
      codeProjects: [project],
      config: {},
    });
    expect(findings.some((f) => f.ruleId === "code/secret-in-tool")).toBe(true);
  });

  it("returns no errors for secure code tools", () => {
    const project = parseCodeFile(
      resolve(root, "examples/code/secure/agent.ts"),
    );
    const findings = runRules(
      [destructiveToolName, dangerousExecute, secretInCode, unrestrictedFileAccess],
      { projects: [], codeProjects: [project], config: {} },
    );
    expect(findings.filter((f) => f.severity === "error")).toHaveLength(0);
  });
});
