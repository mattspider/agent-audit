# CLI

Package: `@agent-audit/cli`

Binário publicado no npm. Invocação via `npx agent-audit`.

## Comandos v1

```bash
# Escanear
agent-audit scan                          # cwd
agent-audit scan ./configs/
agent-audit scan ./mcp.json
agent-audit scan --format sarif > report.sarif
agent-audit scan --format json
agent-audit scan --severity error
agent-audit scan --config .agent-audit.yml

# Setup
agent-audit init                          # cria .agent-audit.yml

# Regras
agent-audit rules list
agent-audit rules explain mcp/broad-filesystem
```

## Flags do `scan`

| Flag | Descrição | Default |
|------|-----------|---------|
| `--format` | `terminal` \| `json` \| `sarif` | `terminal` |
| `--config` | Path para config | `.agent-audit.yml` |
| `--severity` | Filtrar por severity mínima | todas |
| `--fail-on` | Severity que causa exit != 0 | `error` |

## Exit codes

| Code | Significado |
|------|-------------|
| `0` | Nenhum finding acima do threshold |
| `1` | Warnings (se `severity-threshold: warning`) |
| `2` | Errors encontrados |
| `3` | Erro de execução (file not found, parse error) |

## Implementação

- **Framework:** Commander
- **Build:** tsup → bundle ESM/CJS
- **Entry:** `packages/cli/src/index.ts`
