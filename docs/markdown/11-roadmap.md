# Roadmap

## Decisões de arquitetura

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Modelo normalizado | `McpProject` | Parsers plugáveis, regras agnósticas |
| Regras em TS | TypeScript com metadata | Type-safe, testável |
| Config do usuário | YAML | `.agent-audit.yml` |
| Monorepo | pnpm, 5 packages | Isolamento, publicação futura |
| SARIF | Desde v1 | CI-first |
| Plugin API | v4 | YAGNI no MVP |

## MVP — 3 semanas

| Semana | Entrega |
|--------|---------|
| **1** | `parser-mcp` + `core` + 5 regras + testes |
| **2** | `cli` + `reporter` (terminal + JSON) + 5 regras restantes |
| **3** | SARIF + `init` + docs + examples + README + npm publish |

## Versões do produto

```
v1 ─── parser-mcp ──────────────────────────► MVP atual
v2 ─── parser-code (TS/Python AST) ─────────► mesma RuleEngine
v3 ─── parser-runtime (pentest dinâmico) ────► fase 2 do roadmap macro
v4 ─── plugin API (regras custom) ──────────► comunidade
```

```
                    ┌─────────────┐
                    │    core     │
                    │ RuleEngine  │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ parser-mcp  │ │ parser-code │ │ parser-live │
    │   (v1) ✅   │ │   (v2)      │ │   (v3)      │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## Roadmap macro (4 produtos)

| Fase | Produto | Relação com agent-audit |
|------|---------|-------------------------|
| **1** | agent-audit (auditoria MCP) | Este repo |
| 2 | Pentest APIs LLM | Extensão v3 (`parser-live`) |
| 3 | Agent Test Harness | Compartilha `@agent-audit/core` |
| 4 | MCP Tool Kit | Compartilha parsers e regras |

## Publicação npm

| Package | Escopo |
|---------|--------|
| `agent-audit` | CLI (binário principal) |
| `@agent-audit/core` | Engine (uso programático) |
| `@agent-audit/parser-mcp` | Parser standalone |
| `@agent-audit/rules` | Regras built-in |
| `@agent-audit/reporter` | Reporters |

Licença: **MIT**
