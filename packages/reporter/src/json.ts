import type { ScanResult } from "@agent-audit/core";

export function renderJson(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}
