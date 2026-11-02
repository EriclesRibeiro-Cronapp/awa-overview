# Data Model — Tela Pull requests

## PullRequestTableRow

| Campo | Tipo | Regra |
|---|---|---|
| `id` | number | Inteiro positivo |
| `title` | string | Não vazio; até 2 linhas |
| `status` | `active` \| `completed` \| `abandoned` \| `unknown` | Status bruto |
| `project` | string | Nome do projeto |
| `createdAt` | string | ISO 8601 |
| `url` | string | HTTPS permitido |

## PullRequestsView

| Campo | Tipo | Regra |
|---|---|---|
| `context` | OverviewContext \| null | `null` sem projeto |
| `items` | PullRequestTableRow[] | Até 1.000 |
| `truncated` | boolean | Mais de 1.000 no projeto |
| `fetchedAt` | string \| null | Instante da coleta |
| `stale` | boolean | Cache exibido após falha |

`PullRequestsLoadResult = { ok: true; data } | { ok: false; error: AppError }`.

## Snapshot

`pull-requests-cache.json.enc`, schema `1`, TTL `300`.

Campos: `schemaVersion`, `contextKey` (`org|projeto`), `organization`, `projectId`,
`projectName`, `teamId`, `teamName`, `fetchedAt`, `ttlSeconds`, `items`, `truncated`.

## Filtros

```ts
interface PullRequestsFilters {
  search: string;
  status: 'all' | 'active' | 'completed' | 'abandoned';
}
```

- Busca normaliza `!` e caixa.
- Status "all" = todos.
- Filtros em AND; tabela apenas; sem resumo.

## Regras

- Status: `active` → Aberto; `completed` → Concluído; `abandoned` → Abandonado.
- ID exibido com `!`.
- Ordenação `creationDate` desc.
- Limite 1.000; `truncated=true` se mais.
- Nenhum PAT no modelo.
