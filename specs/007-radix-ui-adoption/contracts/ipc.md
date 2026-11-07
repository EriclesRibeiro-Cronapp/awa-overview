# Contrato IPC — Overview v2

## Canal alterado

Apenas `overview:load` muda de forma. Os canais `projects`, `workItems`,
`pullRequests`, `pipelines`, `config`, `session`, `diagnostics`, `windowControls` e
`app` permanecem inalterados.

### Entrada

```ts
interface OverviewLoadInput {
  force?: boolean;
}
```

### Saída

```ts
type OverviewLoadResult =
  | { ok: true; data: OverviewViewV2 }
  | { ok: false; error: AppError };

interface OverviewViewV2 {
  context: OverviewContext | null;
  workItems: CardResult<WorkItemSummary[]>;
  pullRequests: CardResult<PullRequestSummary[]>;
  pipelines: CardResult<PipelineRunSummary[]>;
  fetchedAt: string | null;
  stale: boolean;
}
```

## Regras

- `workItems`, `pullRequests` e `pipelines` contêm no máximo 10 itens.
- Cada card mantém `ok`, `data`, `stale` e `fetchedAt`; erro continua por card.
- O renderer não envia organização, PAT, projeto ou time.
- Cache de Overview v1 é ignorado; o novo snapshot é `schemaVersion: 2`.
- O Hover Card não consome IPC adicional; usa texto editorial fixo.
- Nenhum PAT, header ou URL interna é retornado.
- `force=true` mantém semântica atual.

## Compatibilidade

- Mudança incompatível apenas no shape interno de `overview:load`; renderer e main
  são atualizados juntos.
- Nenhuma migração de dados do usuário além de descartar o cache antigo.
- Testes de contrato devem validar arrays, limites e campos de prioridade.

## Erros

Mesmo catálogo `CFG-001..009`; 401 após identidade válida permanece `CFG-004`.
