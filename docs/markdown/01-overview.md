# Visão Geral

## O que é

**agent-audit** é uma CLI open source que audita configs MCP em busca de misconfigurations de segurança — permissões amplas demais, secrets expostos, servidores sem auth, etc.

É análise **estática** (design-time), não pentest runtime. Comportamento similar a ESLint ou Semgrep, focado em agents e tool calling.

## Escopo v1

- **Input:** configs MCP (Opção A)
- **Formatos:** `.cursor/mcp.json`, `claude_desktop_config.json`, `mcp.json` genérico
- **Output:** terminal, JSON, SARIF (CI / GitHub Code Scanning)

## Escopo futuro (v2+)

- Parse de tools definidas em código (OpenAI SDK, LangChain, Vercel AI SDK)
- Pentest dinâmico de APIs LLM
- Plugin API para regras custom

## Diagrama de alto nível

```
┌──────────────────────────────────────────────────────────────────┐
│                       agent-audit CLI                            │
│  scan │ init │ rules list │ rules explain                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                        @agent-audit/core                         │
│  Scanner ──► RuleEngine ──► Findings ──► Reporter                │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ parser-mcp       │    │ rules (built-in) │    │ reporter        │
│ mcp.json         │    │ TypeScript rules │    │ terminal/json/  │
│ .cursor/mcp.json │    │                  │    │ sarif           │
│ claude_desktop   │    │                  │    │                 │
└──────────────────┘    └──────────────────┘    └─────────────────┘
```

## Princípios de arquitetura

1. **Modelo normalizado** — parsers convertem formatos diferentes para `McpProject`; regras não conhecem Cursor vs Claude Desktop.
2. **Parsers plugáveis** — v2 adiciona `parser-code` sem reescrever o core.
3. **Regras em TypeScript** — type-safe e testáveis; YAML apenas para config do usuário.
4. **CI-first** — SARIF desde v1; exit codes previsíveis.
5. **YAGNI** — 10 regras built-in no MVP; plugin API fica para v4.

## Fluxo de execução

```
scan ./path
    │
    ▼
1. Load config (.agent-audit.yml) — opcional
    │
    ▼
2. Discover files
   glob: mcp.json, .cursor/mcp.json,
         claude_desktop_config.json
    │
    ▼
3. For each file:
   detect format → parse → validate (Zod) → normalize → McpProject
    │
    ▼
4. RuleEngine.run(projects, rules)
   cada regra recebe McpProject[] e retorna Finding[]
    │
    ▼
5. Filter (severity, ignore rules, .agent-audit.yml)
    │
    ▼
6. Reporter (terminal | json | sarif)
    │
    ▼
7. Exit code (0 = clean, 1 = warnings, 2 = errors, 3 = runtime error)
```
