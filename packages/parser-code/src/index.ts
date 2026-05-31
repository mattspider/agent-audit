import { readFileSync } from "node:fs";
import { detectCodeLanguage, likelyContainsTools } from "./detect.js";
import { parsePythonTools } from "./python.js";
import { parseTypeScriptTools } from "./typescript.js";
import type { CodeProject } from "./types.js";

export function parseCodeFile(filePath: string): CodeProject {
  const language = detectCodeLanguage(filePath);
  if (!language) {
    throw new Error(`Unsupported code file: ${filePath}`);
  }

  const content = readFileSync(filePath, "utf8");

  if (!likelyContainsTools(content)) {
    return {
      source: { path: filePath, language },
      tools: [],
    };
  }

  const tools =
    language === "typescript"
      ? parseTypeScriptTools(filePath, content)
      : parsePythonTools(filePath, content);

  return {
    source: { path: filePath, language },
    tools,
  };
}

export { detectCodeLanguage, isCodeFile, likelyContainsTools, CODE_FILE_GLOBS } from "./detect.js";
export type { CodeProject, CodeTool, CodeLanguage, CodeFramework } from "./types.js";
