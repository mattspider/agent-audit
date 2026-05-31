# Spec: agent-audit v0.1.0

| Campo | Valor |
|-------|-------|
| **Status** | Approved — v0.1.0 implemented |
| **Data** | 2026-05-30 |
| **Autor** | Design session |
| **Repo** | `agent-audit` (local: `D:\Dev\mcp-scanner`) |
| **Versão alvo** | `0.1.0` (MVP) |

## Referências

- [Documentação de arquitetura](../../markdown/README.md)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## 1. Resumo executivo

**agent-audit** é uma CLI open source que realiza **auditoria estática** de configs MCP (Model Context Protocol) para detectar misconfigurations de segurança em agents e tool calling.

Comportamento análogo a ESLint ou Semgrep, com foco em:

- permissões excessivas (filesystem, database)
- secrets hardcoded
- servidores sem autenticação
- comandos destrutivos em configs

**Input v0.1.0:** arquivos JSON de config MCP (Cursor, Claude Desktop, genérico).  
**Output:** terminal humano, JSON, SARIF (GitHub Code Scanning).  
**Distribuição:** `npx agent-audit scan`.

---

## 2. Objetivos

### 2.1 Objetivos (in scope v0.1.0)

| ID | Objetivo |
|----|----------|
| G1 | Detectar misconfigurations comuns em configs MCP antes de produção |
| G2 | Integrar em CI/CD via exit codes previsíveis e SARIF |
| G3 | Oferecer DX excelente: zero config inicial, `npx` one-liner |
| G4 | Arquitetura extensível para parsers de código (v2) sem reescrever o core |
| G5 | Documentação clara: cada regra explicada com exemplo e remediação |

### 2.2 Non-goals (fora do v0.1.0)

| ID | Non-goal |
|----|----------|
| NG1 | Pentest dinâmico / fuzzing de APIs LLM (fase 2 do roadmap macro) |
| NG2 | Parse de tools definidas em código TypeScript/Python (v2) |
| NG3 | Plugin API para regras custom da comunidade (v4) |
| NG4 | UI web ou dashboard hosted |
| NG5 | Bloqueio runtime de tool calls (apenas análise estática) |
| NG6 | Suporte a formatos MCP além de JSON (TOML, YAML nativo de config) |

---

## 3. Personas e casos de uso

### 3.1 Personas

| Persona | Necessidade |
|---------|-------------|
| **Dev com Cursor/Claude Desktop** | Validar `mcp.json` antes de commitar |
| **Tech lead / security** | Gate de CI que falha PR com configs inseguras |
| **Maintainer OSS** | Badge + SARIF no repositório |

### 3.2 User stories

| ID | Story | Prioridade |
|----|-------|------------|
| US1 | Como dev, quero rodar `npx agent-audit scan` na raiz e ver findings legíveis | P0 |
| US2 | Como dev, quero `agent-audit init` para gerar `.agent-audit.yml` de exemplo | P1 |
| US3 | Como CI, quero `--format sarif` + exit code 2 em errors | P0 |
| US4 | Como dev, quero `rules explain mcp/broad-filesystem` para entender um finding | P1 |
| US5 | Como dev, quero ignorar regras específicas no config do projeto | P1 |
| US6 | Como dev, quero scan de `.cursor/mcp.json` e `claude_desktop_config.json` automaticamente | P0 |

---

## 4. Requisitos funcionais

### 4.1 Discovery de arquivos

| ID | Requisito |
|----|-----------|
| FR-D1 | Escanear cwd recursivamente por default |
| FR-D2 | Detectar automaticamente: `mcp.json`, `.cursor/mcp.json`, `**/.cursor/mcp.json`, `claude_desktop_config.json` |
| FR-D3 | Aceitar path explícito: arquivo ou diretório |
| FR-D4 | Respeitar `include` / `exclude` de `.agent-audit.yml` |
| FR-D5 | Reportar arquivos scanned em `ScanResult.scannedFiles` |

### 4.2 Parsing

| ID | Requisito |
|----|-----------|
| FR-P1 | Detectar formato: `cursor`, `claude-desktop`, `generic` |
| FR-P2 | Validar estrutura com Zod; emitir warning se parcialmente inválido |
| FR-P3 | Normalizar todos os formatos para `McpProject` |
| FR-P4 | Preservar `raw` original para reporting de JSON path |
| FR-P5 | Se `fail-on-parse-error: true`, exit 3 em parse failure |

### 4.3 Rule engine

| ID | Requisito |
|----|-----------|
| FR-R1 | Executar todas as regras built-in habilitadas |
| FR-R2 | Permitir disable/ignore por rule ID via config |
| FR-R3 | Permitir override de severity por regra via config |
| FR-R4 | Permitir `options` por regra via config |
| FR-R5 | Agregar findings de todos os arquivos num único `ScanResult` |
| FR-R6 | Deduplicar findings idênticos (mesmo ruleId + location) |

### 4.4 CLI

| ID | Requisito |
|----|-----------|
| FR-C1 | Comando `scan [path]` |
| FR-C2 | Comando `init` — escreve `.agent-audit.yml` default |
| FR-C3 | Comando `rules list` — lista regras built-in |
| FR-C4 | Comando `rules explain <ruleId>` — descrição + remediação |
| FR-C5 | Flag `--format terminal|json|sarif` |
| FR-C6 | Flag `--config <path>` |
| FR-C7 | Flag `--severity <level>` — filtrar output |
| FR-C8 | Exit codes: 0 clean, 1 warnings (configurable), 2 errors, 3 runtime error |

### 4.5 Reporting

| ID | Requisito |
|----|-----------|
| FR-O1 | Terminal: severity, rule ID, file, JSON path, message, help |
| FR-O2 | JSON: schema versionado, findings[], summary |
| FR-O3 | SARIF 2.1.0 compatível com GitHub Code Scanning upload |
| FR-O4 | Summary com contagem errors/warnings/info |

---

## 5. Requisitos não-funcionais

| ID | Requisito | Target |
|----|-----------|--------|
| NFR1 | Tempo de scan (10 arquivos, cold) | < 2s |
| NFR2 | Node.js mínimo | 20 LTS |
| NFR3 | TypeScript strict mode | enabled |
| NFR4 | Cobertura de testes (rules + parser) | ≥ 80% |
| NFR5 | Licença | MIT |
| NFR6 | Sem telemetria / phone-home | zero network em scan |
| NFR7 | Cross-platform | Windows, macOS, Linux |

---

## 6. Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 20+ |
| Linguagem | TypeScript 5.x, strict |
| Package manager | pnpm workspaces |
| CLI | Commander |
| Validação | Zod |
| Config YAML | yaml |
| Glob | globby |
| Terminal colors | picocolors |
| Build | tsup |
| Testes | Vitest |
| CI | GitHub Actions |

---

## 7. Arquitetura

### 7.1 Diagrama de componentes

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
│ @agent-audit/    │    │ @agent-audit/    │    │ @agent-audit/   │
│ parser-mcp       │    │ rules            │    │ reporter        │
└──────────────────┘    └──────────────────┘    └─────────────────┘
```

### 7.2 Packages npm

| Package | Responsabilidade | Publicado |
|---------|------------------|-----------|
| `agent-audit` | CLI bin | Sim (principal) |
| `@agent-audit/core` | Scanner, engine, types, config loader | Sim |
| `@agent-audit/parser-mcp` | Parse + normalize MCP configs | Sim |
| `@agent-audit/rules` | Regras built-in | Sim |
| `@agent-audit/reporter` | terminal / json / sarif | Sim |

### 7.3 Grafo de dependências

```
agent-audit (cli)
 ├── @agent-audit/core
 │    ├── @agent-audit/parser-mcp
 │    └── @agent-audit/rules
 └── @agent-audit/reporter
      └── @agent-audit/core (types only)
```

**Invariante:** `@agent-audit/core` nunca depende de `agent-audit` (cli).

### 7.4 Fluxo de execução

```
scan [path]
  → loadAgentAuditConfig(optional)
  → discoverFiles(path, config)
  → for each file:
      detectFormat → parse → validate → normalize → McpProject
  → ruleEngine.run(projects, builtinRules, config)
  → filterBySeverity(findings, cliFlags, config)
  → reporter.render(scanResult, format)
  → exit(exitCodeFromSummary)
```

---

## 8. Modelo de dados

### 8.1 Tipos core

```typescript
type Severity = "error" | "warning" | "info";

type ConfigFormat = "cursor" | "claude-desktop" | "generic";

interface SourceFile {
  path: string;
  format: ConfigFormat;
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
    path?: string;   // JSON Pointer ou dot path
    line?: number;
  };
  metadata?: Record<string, unknown>;
}

interface ScanResult {
  version: string;
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

### 8.2 Config do usuário (`.agent-audit.yml`)

```typescript
interface AgentAuditConfig {
  include?: string[];
  exclude?: string[];
  ignore?: string[];
  severityThreshold?: Severity;
  failOnParseError?: boolean;
  rules?: Record<string, RuleOverride>;
}

interface RuleOverride {
  enabled?: boolean;
  severity?: Severity;
  options?: Record<string, unknown>;
}
```

### 8.3 Precedência de configuração

1. Defaults hardcoded por regra
2. `.agent-audit.yml`
3. Flags CLI (sempre ganham)

---

## 9. Especificação de parsers

### 9.1 Formatos suportados

| Formato | Arquivo | Heurística de detecção |
|---------|---------|------------------------|
| Cursor | `.cursor/mcp.json` | Path termina em `.cursor/mcp.json` |
| Claude Desktop | `claude_desktop_config.json` | Filename match + key `mcpServers` |
| Generic | `mcp.json` ou outro JSON com `mcpServers` | Fallback |

### 9.2 Normalização

Entrada típica:

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

Saída `McpProject`:

```json
{
  "source": { "path": ".cursor/mcp.json", "format": "cursor" },
  "servers": [{
    "name": "filesystem",
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/dev"],
    "raw": { "...": "..." }
  }]
}
```

### 9.3 Inferência de transport

| Condição | transport |
|----------|-----------|
| `command` presente | `stdio` |
| `url` com scheme `http(s)://` + type SSE | `sse` |
| `url` HTTP(S) sem SSE | `http` |

---

## 10. Especificação de regras (v0.1.0)

Todas as regras implementam `Rule.run(ctx: RuleContext): Finding[]`.

### 10.1 `mcp/broad-filesystem`

| Campo | Valor |
|-------|-------|
| **Severity default** | error |
| **Category** | permissions |
| **Triggers when** | Server usa `@modelcontextprotocol/server-filesystem` (ou similar) com path em `args` apontando para `/`, `~`, `$HOME`, ou diretório home detectável |
| **Options** | `allowedPaths: string[]` — paths permitidos |
| **Help** | Restringir ao diretório do projeto, ex.: `./` ou `/workspace` |

### 10.2 `mcp/no-auth`

| Campo | Valor |
|-------|-------|
| **Severity default** | warning |
| **Category** | auth |
| **Triggers when** | Server `transport` = `http` ou `sse` e `headers` ausente ou sem `Authorization` / `X-API-Key` |
| **Help** | Adicionar header de auth ou usar env var referenciada |

### 10.3 `mcp/secret-in-config`

| Campo | Valor |
|-------|-------|
| **Severity default** | error |
| **Category** | secrets |
| **Triggers when** | Valores em config matcham padrões: `sk-`, `AKIA`, `ghp_`, `Bearer `, base64-long, `password:` literal, JWT pattern |
| **Help** | Mover secret para env var; referenciar via `${ENV_VAR}` ou campo `env` |

### 10.4 `mcp/env-secrets`

| Campo | Valor |
|-------|-------|
| **Severity default** | warning |
| **Category** | secrets |
| **Triggers when** | Campo `env` contém valores (não apenas keys) ou keys com sufixo `_KEY`, `_TOKEN`, `_SECRET` com valor inline |
| **Help** | Passar apenas nomes de env vars; valores devem vir do ambiente |

### 10.5 `mcp/dangerous-command`

| Campo | Valor |
|-------|-------|
| **Severity default** | error |
| **Category** | permissions |
| **Triggers when** | `command` ou `args` contêm: `rm -rf`, `curl \| bash`, `wget \| sh`, `chmod 777`, `mkfs`, `dd if=` |
| **Help** | Remover comandos destrutivos; usar server MCP dedicado |

### 10.6 `mcp/unrestricted-database`

| Campo | Valor |
|-------|-------|
| **Severity default** | error |
| **Category** | permissions |
| **Triggers when** | Server postgres/sqlite/mysql MCP sem database/schema restriction nos args |
| **Help** | Passar database read-only ou schema limitado nos args do server |

### 10.7 `mcp/http-server-insecure`

| Campo | Valor |
|-------|-------|
| **Severity default** | warning |
| **Category** | auth |
| **Triggers when** | `url` começa com `http://` (não TLS) |
| **Help** | Usar HTTPS ou localhost-only com justificativa documentada |

### 10.8 `mcp/wildcard-origin`

| Campo | Valor |
|-------|-------|
| **Severity default** | warning |
| **Category** | config |
| **Triggers when** | Config contém `"*"` em campos de origin/CORS/allowedOrigins |
| **Help** | Restringir origens explicitamente |

### 10.9 `mcp/too-many-servers`

| Campo | Valor |
|-------|-------|
| **Severity default** | info |
| **Category** | config |
| **Triggers when** | `servers.length > maxServers` (default 10) |
| **Options** | `maxServers: number` |
| **Help** | Reduzir superfície de ataque; consolidar servers |

### 10.10 `mcp/unknown-server`

| Campo | Valor |
|-------|-------|
| **Severity default** | info |
| **Category** | config |
| **Triggers when** | `command` ou package em `args` não está na allowlist built-in |
| **Options** | `allowlist: string[]` — packages adicionais permitidos |
| **Help** | Verificar origem do pacote; adicionar à allowlist se confiável |

### 10.11 Allowlist built-in (packages conhecidos)

```
@modelcontextprotocol/server-filesystem
@modelcontextprotocol/server-github
mcp-server-postgres
mcp-server-sqlite
@playwright/mcp
... (extensível por release)
```

---

## 11. Especificação da CLI

### 11.1 `agent-audit scan [path]`

| Flag | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `[path]` | string | `.` | Arquivo ou diretório |
| `--format` | enum | `terminal` | `terminal`, `json`, `sarif` |
| `--config` | string | `.agent-audit.yml` | Path do config |
| `--severity` | enum | — | Filtrar findings abaixo deste nível |
| `--fail-on` | enum | `error` | Threshold para exit != 0 |

### 11.2 Exit codes

| Code | Condição |
|------|----------|
| 0 | Nenhum finding ≥ `fail-on` threshold |
| 1 | Warnings ≥ threshold quando `fail-on: warning` |
| 2 | ≥ 1 error (ou ≥ threshold configurado) |
| 3 | Erro de execução (I/O, parse fatal, flag inválida) |

### 11.3 Output terminal (exemplo normativo)

```
agent-audit v0.1.0 — scanned 2 files in 45ms

 ERROR  mcp/broad-filesystem
        .cursor/mcp.json → mcpServers.filesystem
        Filesystem server has access to home directory (/Users/dev)
        → Restrict to project directory: ./src or /project

────────────────────────────────────────
  1 error · 0 warnings · 0 info
```

### 11.4 Output JSON (schema v0.1.0)

```json
{
  "version": "0.1.0",
  "scannedFiles": [".cursor/mcp.json"],
  "durationMs": 45,
  "findings": [],
  "summary": { "errors": 0, "warnings": 0, "info": 0 }
}
```

### 11.5 SARIF

- Versão: SARIF 2.1.0
- `tool.driver.name`: `agent-audit`
- `tool.driver.rules[]`: metadata de cada rule ID
- `results[]`: mapear Finding → SARIF result com level `error`|`warning`|`note`

---

## 12. Estrutura do repositório

```
agent-audit/
├── packages/
│   ├── cli/
│   ├── core/
│   ├── parser-mcp/
│   ├── reporter/
│   └── rules/
├── docs/
│   ├── markdown/                          # arquitetura (referência)
│   └── superpowers/specs/                   # esta spec
├── examples/
│   ├── insecure/
│   └── secure/
├── .github/workflows/
│   ├── ci.yml
│   └── agent-audit-action/                # v0.2.0
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── vitest.config.ts
├── .agent-audit.yml
├── LICENSE
└── README.md
```

**Nota de implementação:** MVP pode iniciar monolítico em `packages/cli` e extrair packages conforme estabilização. A estrutura acima é o target arquitetural.

---

## 13. Testes e qualidade

### 13.1 Estratégia

| Camada | Tipo | Critério de done |
|--------|------|------------------|
| parser-mcp | Unit + snapshot | Todo formato → McpProject esperado |
| rules | Unit | Cada regra: fixture insegura → finding; segura → vazio |
| core | Integration | Scan `examples/insecure/` → errors > 0 |
| reporter | Snapshot | SARIF/JSON estáveis |
| cli | E2E | Spawn process; assert exit code + stdout |

### 13.2 Fixtures obrigatórias

| Fixture | Propósito |
|---------|-----------|
| `examples/insecure/mcp.json` | Trigger ≥ 3 rule IDs |
| `examples/insecure/.cursor/mcp.json` | Cursor format |
| `examples/secure/mcp.json` | Zero errors |

### 13.3 CI pipeline

```yaml
- pnpm install --frozen-lockfile
- pnpm typecheck
- pnpm test
- pnpm build
- node packages/cli/dist/index.js scan examples/insecure → expect exit 2
- node packages/cli/dist/index.js scan examples/secure → expect exit 0
```

---

## 14. Entregáveis do MVP (v0.1.0)

### Semana 1

- [ ] Monorepo scaffold (pnpm, tsconfig, vitest)
- [ ] `@agent-audit/parser-mcp` — detect, parse, normalize
- [ ] `@agent-audit/core` — scanner, engine skeleton
- [ ] 5 regras: broad-filesystem, secret-in-config, dangerous-command, no-auth, env-secrets
- [ ] Fixtures insecure/secure
- [ ] Testes parser + rules

### Semana 2

- [ ] 5 regras restantes
- [ ] `@agent-audit/reporter` — terminal + JSON
- [ ] `agent-audit` CLI — scan, rules list, rules explain
- [ ] `.agent-audit.yml` loader + init command
- [ ] Testes integration + cli e2e

### Semana 3

- [ ] SARIF reporter
- [ ] README + docs por regra
- [ ] GitHub Actions ci.yml
- [ ] npm publish `agent-audit@0.1.0`
- [ ] Tag release v0.1.0

### v0.2.0 (pós-MVP, não bloqueia v0.1.0)

- GitHub Action `agent-audit/action`
- `@agent-audit/parser-code` (TypeScript tools)

---

## 15. Critérios de aceitação (v0.1.0)

| ID | Critério |
|----|----------|
| AC1 | `npx agent-audit scan examples/insecure` retorna exit code 2 |
| AC2 | `npx agent-audit scan examples/secure` retorna exit code 0 |
| AC3 | `--format sarif` produz JSON válido SARIF 2.1.0 |
| AC4 | Todas as 10 regras têm teste unitário dedicado |
| AC5 | `rules explain mcp/broad-filesystem` imprime descrição e help |
| AC6 | `.agent-audit.yml` consegue ignorar regra e alterar severity |
| AC7 | Scan completa em < 2s para fixtures do repo |
| AC8 | Zero requisições de rede durante scan |
| AC9 | README com quickstart de 3 comandos funcional |
| AC10 | Licença MIT presente |

---

## 16. Riscos e mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Formato MCP muda | Parser quebra | Zod + testes snapshot; versionar parser |
| Falsos positivos em secrets | Dev frustration | Patterns conservadores; allowlist; ignore rules |
| Langfuse-like obs space confusion | Positioning | Docs claros: estático, não runtime |
| Manutenção monorepo | Velocity | MVP monolítico ok; extrair depois |
| Nome npm `agent-audit` indisponível | Publish block | Fallback: `@agent-audit/cli` ou scoped only |

---

## 17. Roadmap pós v0.1.0

| Versão | Escopo |
|--------|--------|
| v0.2.0 | GitHub Action, melhorias SARIF |
| v1.0.0 | `@agent-audit/parser-code` (TS/Python AST) |
| v2.0.0 | Pentest dinâmico APIs LLM (produto separado ou módulo) |
| v3.0.0 | Plugin API regras custom |

### Roadmap macro (4 produtos)

| Fase | Produto | Relação |
|------|---------|---------|
| 1 | agent-audit | Este repo |
| 2 | Pentest APIs LLM | Extensão runtime |
| 3 | Agent Test Harness | Compartilha `@agent-audit/core` |
| 4 | MCP Tool Kit | Compartilha parsers |

---

## 18. Glossário

| Termo | Definição |
|-------|-----------|
| **MCP** | Model Context Protocol — padrão para conectar LLMs a tools |
| **Finding** | Resultado de uma regra: problema detectado |
| **Rule** | Função que analisa `McpProject[]` e retorna findings |
| **SARIF** | Static Analysis Results Interchange Format |
| **Static analysis** | Análise sem executar o agente ou chamar APIs |

---

## 19. Aprovação

| Revisor | Status | Data |
|---------|--------|------|
| — | Pendente | — |

**Próximo passo após aprovação:** plano de implementação detalhado (writing-plans) → scaffold semana 1.

---

## Changelog desta spec

| Data | Alteração |
|------|-----------|
| 2026-05-30 | Draft inicial consolidando arquitetura aprovada |
