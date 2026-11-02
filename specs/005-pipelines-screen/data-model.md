# Data Model — Tela Pipelines

## PipelineTableRow

| Campo | Tipo | Regra |
|---|---|---|
| `id` | number | ID da execução |
| `name` | string | Nome da definição |
| `description` | string \| null | Descrição da definição; fallback buildNumber |
| `result` | PipelineResult | succeeded/failed/partiallySucceeded/canceled/unknown |
| `status` | PipelineStatus | completed/inProgress/notStarted/unknown |
| `startedAt` | string \| null | ISO 8601 |
| `finishedAt` | string \| null | ISO 8601 |
| `durationSeconds` | number \| null | Fim − início |
| `project` | string | Nome do projeto |
| `url` | string | HTTPS permitido |

## PipelinesView

| Campo | Tipo | Regra |
|---|---|---|
| `context` | OverviewContext \| null | `null` sem projeto |
| `items` | PipelineTableRow[] | Até 500 |
| `truncated` | boolean | Mais de 500 |
| `fetchedAt` | string \| null | Instante |
| `stale` | boolean | Cache após falha |

`PipelinesLoadResult = { ok: true; data } | { ok: false; error: AppError }`.

## Snapshot

`pipelines-cache.json.enc`, schema `1`, TTL `300`:

`schemaVersion`, `contextKey` (`org|projeto`), `organization`, `projectId`,
`projectName`, `teamId`, `teamName`, `fetchedAt`, `ttlSeconds`, `items`, `truncated`.

## Filtro

```ts
interface PipelinesFilters {
  search: string;
}
```

Busca por nome/descrição, case-insensitive; sem resultado → mensagem vazia.

## Regras

- Status mapeado por `result` + `status`; rótulos acessíveis.
- Duração: diferença em segundos; <60 → `Xs`; ≥60 → `Xm Ys`.
- Execução sem `finishTime` → duração `null` exibida como `—`.
- Descrição: definição; fallback `buildNumber`; fallback `—`.
- Nenhum PAT no modelo.
