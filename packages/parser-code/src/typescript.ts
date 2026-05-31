import ts from "typescript";
import type { CodeFramework, CodeLiteral, CodeTool } from "./types.js";

function getLine(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

function getText(sourceFile: ts.SourceFile, node: ts.Node): string {
  return node.getFullText(sourceFile).trim();
}

function getCalleeName(expr: ts.CallExpression): string | undefined {
  const callee = expr.expression;
  if (ts.isIdentifier(callee)) return callee.text;
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
  return undefined;
}

function getPropertyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return undefined;
}

function collectStringLiterals(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  literals: CodeLiteral[],
): void {
  if (ts.isStringLiteralLike(node)) {
    literals.push({
      value: node.text,
      line: getLine(sourceFile, node),
    });
    return;
  }
  ts.forEachChild(node, (child) =>
    collectStringLiterals(child, sourceFile, literals),
  );
}

function extractToolFromCall(
  filePath: string,
  sourceFile: ts.SourceFile,
  name: string,
  call: ts.CallExpression,
  framework: CodeFramework,
): CodeTool {
  const literals: CodeLiteral[] = [];
  let description: string | undefined;
  let executeSnippet: string | undefined;

  const arg = call.arguments[0];
  if (arg && ts.isObjectLiteralExpression(arg)) {
    for (const prop of arg.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const keyName = getPropertyName(prop.name);
      if (keyName === "description" && ts.isStringLiteralLike(prop.initializer)) {
        description = prop.initializer.text;
      }
      if (keyName === "execute") {
        executeSnippet = getText(sourceFile, prop.initializer).slice(0, 800);
        collectStringLiterals(prop.initializer, sourceFile, literals);
      }
      collectStringLiterals(prop.initializer, sourceFile, literals);
    }
  }

  collectStringLiterals(call, sourceFile, literals);

  return {
    name,
    description,
    file: filePath,
    line: getLine(sourceFile, call),
    framework,
    executeSnippet,
    literals,
  };
}

function extractOpenAiFunctionTool(
  filePath: string,
  sourceFile: ts.SourceFile,
  obj: ts.ObjectLiteralExpression,
): CodeTool | undefined {
  let typeValue: string | undefined;
  let functionObj: ts.ObjectLiteralExpression | undefined;

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const keyName = getPropertyName(prop.name);
    if (keyName === "type" && ts.isStringLiteralLike(prop.initializer)) {
      typeValue = prop.initializer.text;
    }
    if (keyName === "function" && ts.isObjectLiteralExpression(prop.initializer)) {
      functionObj = prop.initializer;
    }
  }

  if (typeValue !== "function" || !functionObj) return undefined;

  let name = "anonymous";
  let description: string | undefined;
  const literals: CodeLiteral[] = [];

  for (const prop of functionObj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const keyName = getPropertyName(prop.name);
    if (keyName === "name" && ts.isStringLiteralLike(prop.initializer)) {
      name = prop.initializer.text;
    }
    if (keyName === "description" && ts.isStringLiteralLike(prop.initializer)) {
      description = prop.initializer.text;
    }
    collectStringLiterals(prop.initializer, sourceFile, literals);
  }

  return {
    name,
    description,
    file: filePath,
    line: getLine(sourceFile, obj),
    framework: "openai",
    literals,
  };
}

function extractLangChainTool(
  filePath: string,
  sourceFile: ts.SourceFile,
  node: ts.FunctionDeclaration | ts.VariableDeclaration,
  name: string,
): CodeTool | undefined {
  const literals: CodeLiteral[] = [];
  let description: string | undefined;

  if (ts.isFunctionDeclaration(node) && node.body) {
    collectStringLiterals(node.body, sourceFile, literals);
  }

  if (node.name && ts.isIdentifier(node.name)) {
    name = node.name.text;
  }

  if (ts.isVariableDeclaration(node) && node.initializer) {
    collectStringLiterals(node.initializer, sourceFile, literals);
  }

  const jsDoc = ts.getJSDocCommentsAndTags(node);
  for (const tag of jsDoc) {
    if (ts.isJSDoc(tag) && tag.comment) {
      description =
        typeof tag.comment === "string"
          ? tag.comment
          : tag.comment.map((c) => c.text).join("");
    }
  }

  return {
    name,
    description,
    file: filePath,
    line: getLine(sourceFile, node),
    framework: "langchain",
    executeSnippet: node.getFullText(sourceFile).slice(0, 800),
    literals,
  };
}

function hasToolDecorator(node: ts.FunctionDeclaration): boolean {
  return (ts.getDecorators(node) ?? []).some((decorator) => {
    const expr = decorator.expression;
    if (ts.isCallExpression(expr)) {
      return getCalleeName(expr) === "tool";
    }
    if (ts.isIdentifier(expr)) return expr.text === "tool";
    return false;
  });
}

export function parseTypeScriptTools(
  filePath: string,
  content: string,
): CodeTool[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const tools: CodeTool[] = [];
  const seen = new Set<string>();

  function addTool(tool: CodeTool) {
    const key = `${tool.name}:${tool.line}`;
    if (seen.has(key)) return;
    seen.add(key);
    tools.push(tool);
  }

  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && ts.isCallExpression(node.initializer)) {
      const callee = getCalleeName(node.initializer);
      if (callee === "tool") {
        const propName = getPropertyName(node.name) ?? "anonymous";
        addTool(
          extractToolFromCall(
            filePath,
            sourceFile,
            propName,
            node.initializer,
            "vercel-ai",
          ),
        );
      }
    }

    if (ts.isCallExpression(node) && getCalleeName(node) === "tool") {
      const parent = node.parent;
      if (ts.isPropertyAssignment(parent)) {
        ts.forEachChild(node, visit);
        return;
      }
      addTool(
        extractToolFromCall(filePath, sourceFile, "anonymous", node, "generic"),
      );
    }

    if (ts.isObjectLiteralExpression(node)) {
      const openAiTool = extractOpenAiFunctionTool(filePath, sourceFile, node);
      if (openAiTool) addTool(openAiTool);
    }

    if (ts.isFunctionDeclaration(node) && hasToolDecorator(node)) {
      const tool = extractLangChainTool(
        filePath,
        sourceFile,
        node,
        node.name?.text ?? "anonymous",
      );
      if (tool) addTool(tool);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return tools;
}
