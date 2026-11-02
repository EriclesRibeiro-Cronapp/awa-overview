# Contrato IPC — Pipelines

## Canal

`pipelines:load`

### Entrada

```ts
interface PipelinesLoadInput {
  force?: boolean;
}
```

O renderer não envia organização, PAT, projeto ou time.

### Saída

```ts
type PipelinesLoadResult =
  | { ok: true; data: PipelinesView }
  | { ok: false; error: AppError };
```

## Regras

- Sem projeto: `ok: true`, `context: null`, `items: []`.
- Sem configuração/PAT: `CFG-001`/`CFG-002`.
- `force=true` ignora cache; falha com cache → `stale=true`.
- Sem PAT/headers na resposta.
- Erros usam `shared/errors.ts`.

## Testes

- Sem projeto → contexto nulo.
- Projeto → nomes resolvidos e `force` repassado.
- Cache fresco → cliente não chamado.
- Falha com cache → stale.
- Nenhuma resposta contém PAT.
