# Contrato — Azure DevOps para Work items

## Base e autenticação

- `https://dev.azure.com/{organization}/_apis`
- `Authorization: Basic base64(":" + PAT)`
- `X-TFS-FedAuthRedirect: Suppress`
- `connectionData` em `7.1-preview.1`; demais recursos em `7.1`
- HTTPS, timeout 15s, retry em 429/5xx; nenhuma mutação

## Area path do time

`GET /{projectId}/{teamId}/_apis/work/teamsettings/teamfieldvalues?api-version=7.1`

- Primeiro `values[].value`; `includeChildren` define `UNDER` ou `=`.
- Sem valor/erro → consultar apenas o projeto.

## Consulta WIQL

`POST /{projectId}/_apis/wit/wiql?api-version=7.1`

```json
{
  "query": "SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project ORDER BY [System.ChangedDate] DESC"
}
```

Com time:

```sql
AND [System.AreaPath] UNDER '<areaPath>'
```

- Todos os estados; sem filtro `AssignedTo`.
- Limite de 2.000 IDs; `truncated` se houver mais.

## Carregamento em lote

`GET /_apis/wit/workitems?ids=1,2,...,200&fields=...&api-version=7.1`

Campos:

- `System.Id`
- `System.WorkItemType`
- `System.Title`
- `System.State`
- `System.IterationPath`
- `System.AssignedTo`
- `System.ChangedDate`

Lotes de 200, sequenciais; máximo de 2.000 itens.

## Mapeamento

| Origem | Destino |
|---|---|
| `System.Id` | `id` |
| `System.WorkItemType` | `type` |
| `System.Title` | `title` |
| `System.State` | `state` |
| último segmento de `System.IterationPath` | `sprint` |
| `System.AssignedTo.displayName` | `assignedTo` |
| `System.ChangedDate` | `changedAt` |
| URL construída | `url` |

URL: `https://dev.azure.com/{org}/{project}/_workitems/edit/{id}`.

## Erros

Mesmo catálogo da feature 002. Em identidade válida + 401 nos endpoints de work
items, retornar `CFG-004` (falta de escopo de Work Items), não `CFG-003`.

## Proibições

- Nenhum `PUT`, `PATCH` ou `DELETE`.
- `POST` apenas no WIQL de consulta (ADR-0011).
- Nenhum PAT em URL, log ou resposta IPC.
- Nenhuma consulta sem `api-version`.
