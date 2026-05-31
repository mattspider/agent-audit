import type { Rule } from "@agent-audit/core";
import { codeLocation, FILE_SYSTEM_PATTERNS } from "../helpers.js";

export const unrestrictedFileAccess: Rule = {
  id: "code/unrestricted-file-access",
  name: "Unrestricted file access in tool",
  description:
    "Detects filesystem operations in tool handlers that may allow arbitrary path access.",
  severity: "warning",
  category: "permissions",
  tags: ["code", "filesystem"],
  help:
    "Validate and restrict file paths to an allowlist before read/write operations",
  run(ctx) {
    const findings = [];

    for (const project of ctx.codeProjects) {
      for (const tool of project.tools) {
        if (!tool.executeSnippet) continue;

        const hasFsOp = FILE_SYSTEM_PATTERNS.some((pattern) =>
          pattern.test(tool.executeSnippet!),
        );
        const usesDynamicPath =
          /readFile(?:Sync)?\s*\(\s*[a-zA-Z_$]/.test(tool.executeSnippet) ||
          /writeFile(?:Sync)?\s*\(\s*[a-zA-Z_$]/.test(tool.executeSnippet);

        if (hasFsOp && usesDynamicPath) {
          findings.push({
            ruleId: "code/unrestricted-file-access",
            severity: "warning" as const,
            message: `Tool "${tool.name}" may read/write files using unvalidated paths`,
            help:
              "Validate and restrict file paths to an allowlist before read/write operations",
            location: codeLocation(tool.file, tool.line, tool.name),
          });
        }
      }
    }

    return findings;
  },
};
