# Reporters

Package: `@agent-audit/reporter`

Converte `ScanResult` em output consumível por humanos ou CI.

## Terminal (default)

```
agent-audit v0.1.0 — scanned 2 files in 45ms

 ERROR  mcp/broad-filesystem
        .cursor/mcp.json → mcpServers.filesystem
        Filesystem server has access to home directory (/Users/dev)
        → Restrict to project directory: ./src or /project

WARNING  mcp/no-auth
        mcp.json → mcpServers.api-server
        HTTP MCP server has no authentication headers
        → Add Authorization header or use env var

────────────────────────────────────────
  1 error · 1 warning · 0 info
```

**Lib:** picocolors para cores sem dependência pesada.

## JSON

Para automação e integrações custom:

```json
{
  "version": "0.1.0",
  "findings": [
    {
      "ruleId": "mcp/broad-filesystem",
      "severity": "error",
      "message": "Filesystem server has access to home directory",
      "location": {
        "file": ".cursor/mcp.json",
        "path": "$.mcpServers.filesystem.args[2]"
      }
    }
  ],
  "summary": { "errors": 1, "warnings": 1, "info": 0 }
}
```

## SARIF

Formato [Static Analysis Results Interchange Format](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning) para GitHub Code Scanning.

Findings aparecem na aba **Security** do repositório quando combinado com `upload-sarif`.

```bash
agent-audit scan --format sarif > agent-audit-results.sarif
```

## Interface

```typescript
interface Reporter {
  format: "terminal" | "json" | "sarif";
  render(result: ScanResult): string;
}
```
