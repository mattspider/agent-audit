#!/usr/bin/env node
/**
 * Copies npm-focused README to packages/cli before publish.
 * Run: node scripts/sync-readme.mjs
 */
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliReadme = resolve(root, "packages/cli/README.md");
const npmReadme = resolve(root, "packages/cli/README.npm.md");

// If README.npm.md exists, use it as source of truth for npm
try {
  const content = readFileSync(npmReadme, "utf8");
  writeFileSync(cliReadme, content);
  console.log("Synced packages/cli/README.md from README.npm.md");
} catch {
  console.log("packages/cli/README.npm.md not found — README.md unchanged");
}
