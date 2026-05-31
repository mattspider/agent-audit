# Modelo de Dados

Todo config MCP passa por um **modelo normalizado** antes de chegar às regras. Parsers convertem formatos diferentes para o mesmo formato; regras não conhecem a origem do arquivo.

## Tipos principais

```typescript
// packages/core/src/types.ts

type Severity = "error" | "warning" | "info";

interface SourceFile {
  path: string;
  format: "cursor" | "claude-desktop" | "generic";
}

interface McpProject {
  source: SourceFile;
  servers: McpServer[];
}

interface McpServer {
  name: string;
  transport: "stdio" | "sse" | "http";
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  headers?: Record<string, string>;
  tools?: McpTool[];
  raw: unknown;
}

interface McpTool {
  name: string;
  description?: string;
  permissions?: string[];
}

interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  help?: string;
  location: {
    file: string;
    path?: string;
    line?: number;
  };
  metadata?: Record<string, unknown>;
}

interface ScanResult {
  findings: Finding[];
  scannedFiles: string[];
  durationMs: number;
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}
```

## Normalização

Cursor e Claude Desktop usam estruturas ligeiramente diferentes. O normalizer unifica:

**Entrada (Cursor / Claude Desktop):**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/dev"]
    }
  }
}
```

**Saída normalizada:**

```json
{
  "source": { "path": ".cursor/mcp.json", "format": "cursor" },
  "servers": [{
    "name": "filesystem",
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/dev"]
  }]
}
```

## ScanResult e exit codes

O `ScanResult.summary` alimenta exit codes da CLI:

| Finding severity | Contribui para |
|------------------|----------------|
| `error` | exit 2 |
| `warning` | exit 1 (se threshold = warning) |
| `info` | nunca falha CI por default |
