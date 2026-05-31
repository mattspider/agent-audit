# Parsers MCP

Package: `@agent-audit/parser-mcp`

Responsável por detectar, validar e normalizar configs MCP de diferentes origens.

## Formatos suportados (v1)

| Formato | Arquivo típico | Detecção |
|---------|----------------|----------|
| Cursor | `.cursor/mcp.json` | path + schema |
| Claude Desktop | `claude_desktop_config.json` | path + key `mcpServers` |
| Genérico | `mcp.json` | schema MCP standard |

## Pipeline

```
Raw JSON
    → detect.ts (qual formato?)
    → cursor.ts | claude-desktop.ts | generic.ts
    → schema.ts (Zod validation)
    → normalize.ts → McpProject
```

## Discovery (glob patterns)

O scanner procura automaticamente:

- `mcp.json`
- `.cursor/mcp.json`
- `**/.cursor/mcp.json`
- `claude_desktop_config.json`

Paths adicionais podem ser configurados em `.agent-audit.yml`.

## Validação (Zod)

Configs inválidas geram:

- **Warning** de parse se estrutura parcialmente legível
- **Error** de execução (exit 3) se `fail-on-parse-error: true`

## Extensão v2

`parser-code` será um package sibling:

```
packages/
├── parser-mcp/     # v1 ✅
└── parser-code/    # v2 — AST TS/Python
```

Ambos produzem estruturas consumíveis pelo mesmo `RuleEngine` (via union type ou adapter).
