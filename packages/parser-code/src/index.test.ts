import { describe, expect, it } from "vitest";
import { parseCodeFile } from "@agent-audit/parser-code";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

describe("parseCodeFile", () => {
  it("extracts insecure TypeScript tools", () => {
    const project = parseCodeFile(
      resolve(root, "examples/code/insecure/agent.ts"),
    );
    expect(project.tools.length).toBeGreaterThanOrEqual(4);
    expect(project.tools.some((t) => t.name === "deleteAllUsers")).toBe(true);
  });

  it("extracts Python tools", () => {
    const project = parseCodeFile(
      resolve(root, "examples/code/insecure/tools.py"),
    );
    expect(project.tools.some((t) => t.name === "delete_all_users")).toBe(true);
  });

  it("returns empty tools for secure file", () => {
    const project = parseCodeFile(
      resolve(root, "examples/code/secure/agent.ts"),
    );
    expect(project.tools.length).toBe(2);
  });
});
