import { describe, expect, it } from "vitest";
import { parseMcpFile } from "@agent-audit/parser-mcp";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

describe("parseMcpFile", () => {
  it("parses insecure mcp.json", () => {
    const project = parseMcpFile(resolve(root, "examples/insecure/mcp.json"));
    expect(project.servers).toHaveLength(4);
    expect(project.source.format).toBe("generic");
  });

  it("parses cursor format from path", () => {
    const project = parseMcpFile(
      resolve(root, "examples/insecure/.cursor/mcp.json"),
    );
    expect(project.source.format).toBe("cursor");
    expect(project.servers.some((s) => s.name === "remote-api")).toBe(true);
  });

  it("parses secure mcp.json", () => {
    const project = parseMcpFile(resolve(root, "examples/secure/mcp.json"));
    expect(project.servers).toHaveLength(2);
  });
});
