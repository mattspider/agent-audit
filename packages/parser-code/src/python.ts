import type { CodeTool } from "./types.js";

const OPENAI_TOOL_PATTERN =
  /\{\s*["']type["']\s*:\s*["']function["']\s*,\s*["']function["']\s*:\s*\{[^}]*["']name["']\s*:\s*["']([^"']+)["']/gs;

const PYTHON_TOOL_DEF_PATTERN =
  /@tool\s*\n\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;

const PYTHON_OPENAI_NAME_PATTERN =
  /["']name["']\s*:\s*["']([^"']+)["']/g;

const STRING_LITERAL_PATTERN = /(["'])(?:(?=(\\?))\2.)*?\1/g;

function findLineNumber(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function extractPythonStringLiterals(
  content: string,
  startIndex: number,
  endIndex: number,
): CodeTool["literals"] {
  const slice = content.slice(startIndex, endIndex);
  const literals: CodeTool["literals"] = [];
  for (const match of slice.matchAll(STRING_LITERAL_PATTERN)) {
    if (match.index === undefined) continue;
    const raw = match[0];
    const value = raw.slice(1, -1);
    if (value.length >= 8) {
      literals.push({
        value,
        line: findLineNumber(content, startIndex + match.index),
      });
    }
  }
  return literals;
}

export function parsePythonTools(filePath: string, content: string): CodeTool[] {
  const tools: CodeTool[] = [];
  const seen = new Set<string>();

  for (const match of content.matchAll(PYTHON_TOOL_DEF_PATTERN)) {
    const name = match[1];
    const index = match.index ?? 0;
    const key = `${name}:${index}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const blockEnd = content.indexOf("\ndef ", index + match[0].length);
    const end = blockEnd === -1 ? content.length : blockEnd;
    const block = content.slice(index, end);

    tools.push({
      name,
      file: filePath,
      line: findLineNumber(content, index),
      framework: "langchain",
      executeSnippet: block.slice(0, 800),
      literals: extractPythonStringLiterals(content, index, end),
    });
  }

  for (const match of content.matchAll(OPENAI_TOOL_PATTERN)) {
    const name = match[1];
    const index = match.index ?? 0;
    const key = `openai:${name}:${index}`;
    if (seen.has(key)) continue;
    seen.add(key);

    tools.push({
      name,
      file: filePath,
      line: findLineNumber(content, index),
      framework: "openai",
      executeSnippet: match[0].slice(0, 800),
      literals: extractPythonStringLiterals(
        content,
        index,
        index + match[0].length,
      ),
    });
  }

  if (tools.length === 0 && content.includes("@tool")) {
    for (const match of content.matchAll(PYTHON_OPENAI_NAME_PATTERN)) {
      const name = match[1];
      const index = match.index ?? 0;
      tools.push({
        name,
        file: filePath,
        line: findLineNumber(content, index),
        framework: "generic",
        literals: [{ value: match[0], line: findLineNumber(content, index) }],
      });
    }
  }

  return tools;
}
