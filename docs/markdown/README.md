# agent-audit — Documentação de Arquitetura

Auditoria estática de configs MCP (Model Context Protocol) para detectar misconfigurations de segurança em agents e tool calling.

## Stack

- **Runtime:** Node.js 20+
- **Linguagem:** TypeScript
- **Package manager:** pnpm workspaces
- **Testes:** Vitest
- **Distribuição:** npm → `npx agent-audit scan`

## Documentação formal

- **[Spec v0.1.0](../superpowers/specs/2026-05-30-agent-audit-design.md)** — requisitos, regras, critérios de aceitação, MVP

## Índice (arquitetura)

| Documento | Conteúdo |
|-----------|----------|
| [01-overview.md](./01-overview.md) | Visão geral e princípios |
| [02-repository-structure.md](./02-repository-structure.md) | Estrutura do monorepo |
| [03-data-model.md](./03-data-model.md) | Tipos e modelos internos |
| [04-parsers.md](./04-parsers.md) | Parser MCP e formatos suportados |
| [05-rule-engine.md](./05-rule-engine.md) | Motor de regras e regras v1 |
| [06-cli.md](./06-cli.md) | Comandos e exit codes |
| [07-reporters.md](./07-reporters.md) | Terminal, JSON e SARIF |
| [08-configuration.md](./08-configuration.md) | `.agent-audit.yml` |
| [09-ci.md](./09-ci.md) | GitHub Actions e integração CI |
| [10-testing.md](./10-testing.md) | Estratégia de testes |
| [11-roadmap.md](./11-roadmap.md) | Roadmap v1 → v4 |

## Roadmap do produto (macro)

| Fase | Projeto | Status |
|------|---------|--------|
| **1** | Auditoria MCP (este repo) | Em design |
| 2 | Pentest automatizado para APIs LLM | Futuro |
| 3 | Agent Test Harness | Futuro |
| 4 | MCP Tool Kit | Futuro |
