# Motor de Regras

Package: `@agent-audit/core` (engine) + `@agent-audit/rules` (implementações)

## Interface de uma regra

```typescript
interface Rule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  category: "auth" | "permissions" | "secrets" | "config";
  tags: string[];
  run: (ctx: RuleContext) => Finding[];
}

interface RuleContext {
  projects: McpProject[];
  config: AgentAuditConfig;
}
```

## Regras built-in v1

| ID | Severity | O que detecta |
|----|----------|---------------|
| `mcp/broad-filesystem` | error | Filesystem apontando para `/`, `~`, ou home inteira |
| `mcp/no-auth` | warning | Server HTTP/SSE sem headers de auth |
| `mcp/secret-in-config` | error | API keys, tokens, passwords hardcoded |
| `mcp/env-secrets` | warning | Env vars com nomes suspeitos (`*_KEY`, `*_TOKEN`) |
| `mcp/dangerous-command` | error | `rm -rf`, `curl \| bash`, comandos destrutivos |
| `mcp/unrestricted-database` | error | Postgres/SQLite sem restrição de schema/database |
| `mcp/http-server-insecure` | warning | URL `http://` (não HTTPS) |
| `mcp/wildcard-origin` | warning | CORS ou origem `*` em configs |
| `mcp/too-many-servers` | info | Mais de N servers (default: 10) |
| `mcp/unknown-server` | info | Server não reconhecido na allowlist |

## Registry

```typescript
// packages/rules/src/registry.ts
import { broadFilesystem } from "./rules/mcp-broad-filesystem";
// ...

export const builtinRules: Rule[] = [
  broadFilesystem,
  noAuth,
  secretInConfig,
  // ...
];
```

## Configuração por regra

Regras podem expor `options` configuráveis via `.agent-audit.yml`:

```yaml
rules:
  "mcp/broad-filesystem":
    severity: error
    options:
      allowedPaths: ["/project", "./src"]
  "mcp/too-many-servers":
    enabled: false
    options:
      maxServers: 15
```

## Extensibilidade (v4)

Plugin API para regras custom em TypeScript ou YAML declarativo. Fora do escopo do MVP.
