# Estratégia de Testes

Framework: **Vitest** (workspace root + per-package).

## Por camada

| Camada | Estratégia |
|--------|------------|
| `parser-mcp` | Fixtures JSON reais → snapshot do `McpProject` normalizado |
| `rules` | Unit: config insegura → finding esperado (rule ID, severity, path) |
| `core` | Integration: scan completo em `examples/insecure/` |
| `reporter` | Snapshot SARIF/JSON |
| `cli` | E2E: spawn CLI, assert exit code + stdout |

## Fixtures

```
examples/
├── insecure/
│   ├── mcp.json              # broad filesystem + secret hardcoded
│   └── .cursor/mcp.json      # no auth + dangerous command
└── secure/
    └── mcp.json              # config limpa
```

## Casos de teste obrigatórios (v1)

```typescript
describe("scan examples/insecure", () => {
  it("returns exit code 2", async () => {
    const result = await scan("./examples/insecure");
    expect(result.summary.errors).toBeGreaterThan(0);
  });

  it("detects mcp/broad-filesystem", async () => {
    const result = await scan("./examples/insecure/mcp.json");
    expect(result.findings).toContainEqual(
      expect.objectContaining({ ruleId: "mcp/broad-filesystem" })
    );
  });
});

describe("scan examples/secure", () => {
  it("returns exit code 0", async () => {
    const result = await scan("./examples/secure");
    expect(result.summary.errors).toBe(0);
  });
});
```

## CI

```yaml
# .github/workflows/ci.yml
- run: pnpm install
- run: pnpm test
- run: pnpm typecheck
- run: pnpm build
```

Coverage target MVP: **>80%** em `rules` e `parser-mcp`.
