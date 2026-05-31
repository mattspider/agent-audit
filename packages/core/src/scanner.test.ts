import { describe, expect, it } from "vitest";
import { scan } from "./scanner.js";
import { builtinRules, codeRules } from "@agent-audit/rules";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

describe("scan integration", () => {
  it("returns exit 2 for insecure examples", async () => {
    const { result, exitCode } = await scan({
      paths: [resolve(root, "examples/insecure")],
      config: { severityThreshold: "error" },
      rules: builtinRules,
    });
    expect(result.summary.errors).toBeGreaterThan(0);
    expect(exitCode).toBe(2);
  });

  it("returns exit 0 for secure examples", async () => {
    const { exitCode, result } = await scan({
      paths: [resolve(root, "examples/secure/mcp.json")],
      config: { severityThreshold: "error" },
      rules: builtinRules,
    });
    expect(result.summary.errors).toBe(0);
    expect(exitCode).toBe(0);
  });

  it("returns exit 3 for missing path", async () => {
    const { exitCode } = await scan({
      paths: [resolve(root, "does-not-exist")],
      rules: builtinRules,
    });
    expect(exitCode).toBe(3);
  });

  it("scans code examples with exit 2", async () => {
    const { exitCode, result } = await scan({
      paths: [resolve(root, "examples/code/insecure")],
      targets: ["code"],
      rules: codeRules,
    });
    expect(result.summary.errors).toBeGreaterThan(0);
    expect(exitCode).toBe(2);
  });
});
