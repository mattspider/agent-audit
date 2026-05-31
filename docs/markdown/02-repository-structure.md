# Estrutura do Repositório

Monorepo **pnpm workspaces** com packages isolados por responsabilidade.

```
agent-audit/
├── packages/
│   ├── cli/                      # binário publicado no npm
│   │   ├── src/
│   │   │   ├── index.ts          # entry point
│   │   │   ├── commands/
│   │   │   │   ├── scan.ts
│   │   │   │   ├── init.ts
│   │   │   │   └── rules.ts
│   │   │   └── utils/
│   │   │       └── exit-codes.ts
│   │   └── package.json
│   │
│   ├── core/                     # orquestração do scan
│   │   ├── src/
│   │   │   ├── scanner.ts        # descobre arquivos, chama parsers
│   │   │   ├── engine.ts         # executa regras sobre AST normalizado
│   │   │   ├── config.ts         # lê .agent-audit.yml
│   │   │   ├── types.ts          # Finding, Severity, Rule, Context
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── parser-mcp/               # v1: só MCP
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── detect.ts         # detecta tipo de config
│   │   │   ├── cursor.ts         # .cursor/mcp.json
│   │   │   ├── claude-desktop.ts # claude_desktop_config.json
│   │   │   ├── generic.ts        # mcp.json genérico
│   │   │   ├── normalize.ts      # → McpProject (modelo interno)
│   │   │   └── schema.ts         # Zod schemas
│   │   └── package.json
│   │
│   ├── reporter/                 # formatos de output
│   │   ├── src/
│   │   │   ├── terminal.ts       # output colorido humano
│   │   │   ├── json.ts
│   │   │   ├── sarif.ts          # GitHub Code Scanning
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── rules/                    # regras built-in
│       ├── src/
│       │   ├── index.ts          # exporta todas as regras
│       │   ├── registry.ts
│       │   └── rules/
│       │       ├── mcp-no-auth.ts
│       │       ├── mcp-broad-filesystem.ts
│       │       ├── mcp-secret-in-config.ts
│       │       ├── mcp-env-secrets.ts
│       │       └── ...
│       └── package.json
│
├── docs/
│   └── markdown/                 # esta documentação
│
├── examples/
│   ├── insecure/                 # configs propositalmente ruins
│   │   └── mcp.json
│   └── secure/
│       └── mcp.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── agent-audit-action/   # GitHub Action (v1.1)
│           └── action.yml
│
├── package.json                  # pnpm workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── vitest.config.ts
├── .agent-audit.yml              # config exemplo no repo
├── LICENSE                       # MIT
└── README.md
```

## Dependências entre packages

```
cli
 ├── core
 │    ├── parser-mcp
 │    └── rules
 └── reporter
      └── core (types)
```

**Regras:**

- `core` não depende de `cli`
- `parser-mcp` e `rules` são plugáveis
- v2 adiciona `parser-code` como sibling de `parser-mcp`

## Dependências principais

| Pacote | Uso |
|--------|-----|
| `commander` | CLI (`scan`, `init`, `rules list`) |
| `zod` | Validar schema MCP |
| `yaml` | Config declarativa do usuário |
| `picocolors` | Output terminal |
| `globby` | Encontrar configs |
| `vitest` | Testes |
| `tsup` | Build do CLI |

## Estratégia MVP

O monorepo completo é o **alvo**. Para acelerar o MVP, pode-se começar com um único package (`packages/cli`) e extrair `core`, `parser-mcp`, etc. quando a separação fizer sentido.
