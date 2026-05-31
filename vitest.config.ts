import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  test: {
    globals: false,
    include: ["packages/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@agent-audit/core": resolve(root, "packages/core/src/index.ts"),
      "@agent-audit/parser-mcp": resolve(root, "packages/parser-mcp/src/index.ts"),
      "@agent-audit/rules": resolve(root, "packages/rules/src/index.ts"),
      "@agent-audit/parser-code": resolve(root, "packages/parser-code/src/index.ts"),
      "@agent-audit/reporter": resolve(root, "packages/reporter/src/index.ts"),
    },
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },
});
