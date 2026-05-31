export type CodeLanguage = "typescript" | "python";

export type CodeFramework =
  | "vercel-ai"
  | "openai"
  | "langchain"
  | "generic";

export interface CodeLiteral {
  value: string;
  line: number;
}

export interface CodeTool {
  name: string;
  description?: string;
  file: string;
  line: number;
  framework: CodeFramework;
  executeSnippet?: string;
  literals: CodeLiteral[];
}

export interface CodeProject {
  source: {
    path: string;
    language: CodeLanguage;
  };
  tools: CodeTool[];
}
