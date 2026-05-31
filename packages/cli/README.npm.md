# @agent-audit/cli

Static security audit for **MCP configs** and **AI agent tool definitions** in TypeScript/Python.

[![npm version](https://img.shields.io/npm/v/@agent-audit/cli?style=flat-square)](https://www.npmjs.com/package/@agent-audit/cli)
[![license](https://img.shields.io/npm/l/@agent-audit/cli?style=flat-square)](https://www.npmjs.com/package/@agent-audit/cli)
[![node](https://img.shields.io/node/v/@agent-audit/cli?style=flat-square)](https://www.npmjs.com/package/@agent-audit/cli)

## Install

```bash
npm install -D @agent-audit/cli
```

```bash
pnpm add -D @agent-audit/cli
```

## Quick start

```bash
# Scan MCP configs + agent tool code (default)
npx agent-audit scan

# MCP configs only
npx agent-audit scan --mcp-only

# TypeScript/Python tools only
npx agent-audit scan --code-only ./src
```

Add to `package.json`:

```json
{
  "scripts": {
    "audit": "agent-audit scan"
  }
}
```

## Example output

```
agent-audit v0.2.0 — scanned 2 file(s) in 46ms

 ERROR  mcp/broad-filesystem
        .cursor/mcp.json → $.mcpServers.filesystem
        Filesystem server exposes overly broad paths

 ERROR  code/secret-in-tool
        src/agent.ts → fetchWithSecret
        Tool contains a potential hardcoded secret

────────────────────────────────────────
  2 error · 0 warning · 0 info
```

## What it scans

| Target | Files |
|--------|-------|
| MCP | `mcp.json`, `.cursor/mcp.json`, `claude_desktop_config.json` |
| Code | `*.ts`, `*.tsx`, `*.py` — Vercel AI `tool()`, OpenAI tools, LangChain `@tool` |

**15 built-in rules** — secrets, dangerous commands, filesystem scope, destructive tool names, and more.

## CI

```yaml
- run: npx @agent-audit/cli scan --format sarif > agent-audit.sarif
```

Requires **Node.js 20+**.

## Links

- [Full documentation on GitHub](https://github.com/agent-audit/agent-audit#readme)
- [Report issues](https://github.com/agent-audit/agent-audit/issues)

## License

MIT
