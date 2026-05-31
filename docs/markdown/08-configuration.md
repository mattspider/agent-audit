# Configuração

Arquivo: `.agent-audit.yml` na raiz do projeto (ou path custom via `--config`).

Gerado por `agent-audit init`.

## Exemplo completo

```yaml
# .agent-audit.yml

include:
  - ".cursor/mcp.json"
  - "mcp.json"

exclude:
  - "examples/insecure/**"

rules:
  "mcp/broad-filesystem":
    severity: error
    options:
      allowedPaths: ["./", "/workspace"]

  "mcp/too-many-servers":
    enabled: false

ignore:
  - "mcp/unknown-server"
  - "mcp/too-many-servers"

severity-threshold: error
fail-on-parse-error: true
```

## Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `include` | `string[]` | Glob patterns adicionais para scan |
| `exclude` | `string[]` | Paths ignorados |
| `rules.<id>.enabled` | `boolean` | Habilita/desabilita regra |
| `rules.<id>.severity` | `Severity` | Override de severity |
| `rules.<id>.options` | `object` | Opções específicas da regra |
| `ignore` | `string[]` | Rule IDs ignorados globalmente |
| `severity-threshold` | `Severity` | Severity mínima para exit != 0 |
| `fail-on-parse-error` | `boolean` | Exit 3 se config MCP inválida |

## Precedência

1. Defaults da regra (código)
2. `.agent-audit.yml`
3. Flags CLI (`--severity`, etc.)

Flags CLI sempre ganham sobre arquivo de config.
