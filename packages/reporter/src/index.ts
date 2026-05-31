import type { ScanResult } from "@agent-audit/core";
import { renderJson } from "./json.js";
import { renderSarif } from "./sarif.js";
import { renderTerminal } from "./terminal.js";

export type OutputFormat = "terminal" | "json" | "sarif";

export function render(result: ScanResult, format: OutputFormat): string {
  switch (format) {
    case "json":
      return renderJson(result);
    case "sarif":
      return renderSarif(result);
    case "terminal":
    default:
      return renderTerminal(result);
  }
}

export { renderTerminal, renderJson, renderSarif };
