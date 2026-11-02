# Contrato IPC — Pull requests

## Canal

`pullRequests:load`

### Entrada

```ts
interface PullRequestsLoadInput {
  force?: boolean;
}
```

O renderer não envia organização, PAT, projeto ou time; o main resolve pela
configuração.

### Saída

```ts
type PullRequestsLoadResult =
  | { ok: true; data: PullRequestsView }
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
