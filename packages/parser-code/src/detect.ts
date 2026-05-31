import { extname } from "node:path";
import type { CodeLanguage } from "./types.js";

const CODE_EXTENSIONS: Record<string, CodeLanguage> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".py": "python",
};

export function detectCodeLanguage(filePath: string): CodeLanguage | undefined {
  return CODE_EXTENSIONS[extname(filePath).toLowerCase()];
}

export function isCodeFile(filePath: string): boolean {
  return detectCodeLanguage(filePath) !== undefined;
}

export const CODE_FILE_GLOBS = ["**/*.{ts,tsx}", "**/*.py"];

export const CODE_SCAN_KEYWORDS = [
  "tool(",
  "tools:",
  "tools =",
  "@tool",
  '"function"',
  "'function'",
];

export function likelyContainsTools(content: string): boolean {
  return CODE_SCAN_KEYWORDS.some((keyword) => content.includes(keyword));
}
