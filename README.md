# agent-audit

Static security audit for **MCP configs** and **AI agent tool code**. Catch misconfigurations before they reach production.

[![npm version](https://img.shields.io/npm/v/@agent-audit/cli?style=flat-square&color=22c55e)](https://www.npmjs.com/package/@agent-audit/cli)
[![license](https://img.shields.io/npm/l/@agent-audit/cli?style=flat-square)](https://www.npmjs.com/package/@agent-audit/cli)
[![node](https://img.shields.io/node/v/@agent-audit/cli?style=flat-square)](https://www.npmjs.com/package/@agent-audit/cli)

<p align="center">
  <a href="https://www.npmjs.com/package/@agent-audit/cli">npm</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#rules">Rules</a> ·
  <a href="./docs/markdown/README.md">Architecture</a>
</p>

---

## Why agent-audit?

AI agents connect to filesystems, databases, and shell commands through **MCP servers** and **tool definitions in code**. One bad config or `deleteAllUsers` tool can expose production data.

**agent-audit** scans your project statically — no LLM calls, no runtime — and reports security issues in seconds.

| | |
|---|---|
| **MCP configs** | `mcp.json`, `.cursor/mcp.json`, Claude Desktop |
| **Agent code** | TypeScript/Python tool handlers (Vercel AI, OpenAI, LangChain) |
| **Output** | Terminal, JSON, SARIF for CI |
| **Rules** | 15 built-in checks (secrets, auth, filesystem, destructive tools) |

## Quick start

```bash
npm install -D @agent-audit/cli
```

```bash
# Scan everything (MCP + code)
npx agent-audit scan

# MCP configs only
npx agent-audit scan --mcp-only

# Agent tool definitions only
npx agent-audit scan --code-only ./src
```

Add to `package.json`:

```json
{
  "scripts": {
    "audit": "agent-audit scan",
    "audit:code": "agent-audit scan --code-only ./src"
  }
}
```

## Example output

```
agent-audit v0.2.0 — scanned 3 file(s) in 52ms

 ERROR  mcp/broad-filesystem
        .cursor/mcp.json → $.mcpServers.filesystem
        Filesystem server exposes path "/" or home directory

 ERROR  code/secret-in-tool
        src/agent.ts → fetchWithSecret
        Tool contains a potential hardcoded secret

 WARNING  code/unrestricted-file-access
        src/agent.ts → readAnyFile
        Tool may read/write files using unvalidated paths

────────────────────────────────────────
  2 error · 1 warning · 0 info
```

## How it works

```
  mcp.json ──┐
.cursor/  ──┼──►  Parsers  ──►  Rule engine  ──►  Terminal / JSON / SARIF
  src/*.ts ──┘      (MCP + code)     (15 rules)
```

1. **Discover** — recursive scan for MCP configs and tool definition files
2. **Parse** — normalize into a shared model (`McpProject`, `CodeProject`)
3. **Audit** — run built-in rules with configurable severity and ignores

## Commands

```bash
agent-audit scan [paths...]    # Scan MCP + code (default: .)
agent-audit scan --mcp-only    # MCP configs only
agent-audit scan --code-only   # Tool definitions only
agent-audit init               # Create .agent-audit.yml
agent-audit rules list         # List built-in rules
agent-audit rules explain <id> # Explain a rule
```

### Scan paths

```bash
agent-audit scan                      # entire project
agent-audit scan ./apps ./.cursor     # multiple folders
agent-audit scan .cursor/mcp.json     # single file
agent-audit scan --format sarif > results.sarif
```

## Rules

### MCP (`mcp/*`)

| Rule | Severity | Description |
|------|----------|-------------|
| `mcp/broad-filesystem` | error | Filesystem access to `/`, home, etc. |
| `mcp/secret-in-config` | error | Hardcoded API keys and tokens |
| `mcp/dangerous-command` | error | Destructive shell commands |
| `mcp/no-auth` | warning | HTTP/SSE without auth headers |
| `mcp/env-secrets` | warning | Inline secrets in env block |
| `mcp/unrestricted-database` | error | Database without restrictions |
| `mcp/http-server-insecure` | warning | `http://` URLs |
| `mcp/wildcard-origin` | warning | Wildcard CORS/origin |
| `mcp/too-many-servers` | info | Too many MCP servers |
| `mcp/unknown-server` | info | Unknown server packages |

### Code (`code/*`)

| Rule | Severity | Description |
|------|----------|-------------|
| `code/destructive-tool-name` | error | Destructive-sounding tool names |
| `code/dangerous-execute` | error | Shell/exec in tool handlers |
| `code/secret-in-tool` | error | Hardcoded secrets in tool code |
| `code/unrestricted-file-access` | warning | Unvalidated file paths |
| `code/too-many-tools` | info | Too many tools in one file |

## Configuration

```bash
agent-audit init
```

```yaml
# .agent-audit.yml
severityThreshold: error
failOnParseError: true

targets:
  - mcp
  - code

ignore:
  - "mcp/unknown-server"

rules:
  "mcp/broad-filesystem":
    options:
      allowedPaths: ["./", "/workspace"]
```

## CI

```yaml
- name: Audit MCP and agent tools
  run: npx @agent-audit/cli scan --format sarif > agent-audit.sarif

- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: agent-audit.sarif
```

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Clean |
| 1 | Warnings (when `--fail-on warning`) |
| 2 | Errors found |
| 3 | Runtime error |

## Packages

| npm package | Description |
|-------------|-------------|
| [`@agent-audit/cli`](https://www.npmjs.com/package/@agent-audit/cli) | CLI — install this |
| [`@agent-audit/core`](https://www.npmjs.com/package/@agent-audit/core) | Scanner engine |
| [`@agent-audit/rules`](https://www.npmjs.com/package/@agent-audit/rules) | Built-in rules |
| [`@agent-audit/parser-mcp`](https://www.npmjs.com/package/@agent-audit/parser-mcp) | MCP config parser |
| [`@agent-audit/parser-code`](https://www.npmjs.com/package/@agent-audit/parser-code) | TS/Python tool parser |
| [`@agent-audit/reporter`](https://www.npmjs.com/package/@agent-audit/reporter) | Output formatters |

## Development

```bash
git clone https://github.com/agent-audit/agent-audit.git
cd agent-audit
pnpm install
pnpm build
pnpm test
pnpm agent-audit scan examples/insecure
pnpm agent-audit scan examples/code/insecure --code-only
```

### Publish (maintainers)

```bash
pnpm sync-readme   # sync npm README from README.npm.md
pnpm publish:npm
```

## Docs

- [Architecture](./docs/markdown/README.md)
- [Spec v0.1.0](./docs/superpowers/specs/2026-05-30-agent-audit-design.md)

## License

MIT
