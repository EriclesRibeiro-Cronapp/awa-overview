# Data Model — Tela Work items

## Contexto

Mesmo `OverviewContext` da feature 002: organização, projeto e time selecionados.
`contextKey = organização|projeto|time`.

## WorkItemTableRow

| Campo | Tipo | Regra |
|---|---|---|
| `id` | number | Inteiro positivo |
| `type` | string | Ex.: Bug, PBI, Task |
| `title` | string | Não vazio; até duas linhas na tabela |
| `state` | string | Estado bruto do Azure DevOps |
| `sprint` | string \| null | Último segmento de `System.IterationPath` |
| `assignedTo` | string \| null | Nome de exibição |
| `changedAt` | string | ISO 8601 |
| `url` | string | HTTPS permitido no Azure DevOps |

## WorkItemsSummary

| Campo | Tipo | Regra |
|---|---|---|
| `total` | number | Todos os itens carregados |
| `backlog` | number | Estados de backlog |
| `inProgress` | number | Estados em andamento |
| `done` | number | Estados concluídos |

Classificação (case-insensitive):

- **Backlog**: `New`, `Backlog`, `Approved`, `To Do`, `Proposed`.
- **Em andamento**: `Active`, `In Progress`, `Doing`, `Committed`.
- **Concluído**: `Closed`, `Done`, `Resolved`, `Completed`.
- Outros estados: apenas em `total`.

## WorkItemsView

| Campo | Tipo | Regra |
|---|---|---|
| `context` | OverviewContext \| null | `null` sem projeto |
| `items` | WorkItemTableRow[] | Até 2.000 |
| `summary` | WorkItemsSummary | Calculado dos itens carregados |
| `truncated` | boolean | `true` se o WIQL retornou mais que o limite |
| `fetchedAt` | string \| null | Instante da coleta |
| `stale` | boolean | Cache exibido após falha/cache vencido |

`WorkItemsLoadResult = { ok: true; data: WorkItemsView } | { ok: false; error: AppError }`.

## WorkItemsSnapshot

Arquivo `work-items-cache.json.enc`, schema `1`, TTL `300`.

| Campo | Tipo |
|---|---|
| `schemaVersion` | 1 |
| `contextKey` | string |
| `organization` | string |
| `projectId` | string |
| `projectName` | string |
| `teamId` | string \| null |
| `teamName` | string \| null |
| `fetchedAt` | string |
| `ttlSeconds` | number |
| `items` | WorkItemTableRow[] |
| `truncated` | boolean |

Regras: ignora contexto/schema diferente; cache corrompido = ausente; limpar na
troca de organização/remoção/contexto.

## Filtros

```ts
interface WorkItemsFilters {
  search: string;
  type: string;
  assignee: string;
  status: string;
  sprint: string;
}
```

- Valores vazios significam "todos".
- Busca normaliza `#`, caixa e acentos não são removidos (busca textual simples).
- Opções são derivadas dos itens; `null`/vazio vira "—" nos seletores.
- Filtros são aplicados em AND, apenas na tabela; resumo permanece do contexto.

## Regras de carregamento

- WIQL: projeto + area path do time (quando disponível), todos os estados,
  `ORDER BY System.ChangedDate DESC`.
- Lote de 200 IDs por `GET /wit/workitems`.
- Limite de 2.000 itens; `truncated=true` quando houver mais IDs.
- `sprint` = último segmento de `System.IterationPath`; fallback `null`.
- Nenhum campo de PAT/credencial no modelo.
