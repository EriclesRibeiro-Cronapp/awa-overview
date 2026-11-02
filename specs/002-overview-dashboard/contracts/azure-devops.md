# Contrato — Azure DevOps para o Overview

## Base e autenticação

- Base: `https://dev.azure.com/{organization}/_apis`.
- `Authorization: Basic base64(":" + PAT)`.
- `X-TFS-FedAuthRedirect: Suppress` para receber `401` em vez de HTML de login.
- HTTPS obrigatório; timeout de 15s; retry somente em 429 e 5xx.
- Nenhuma mutação: os únicos `POST` são consultas WIQL somente leitura.

## Versões

| Recurso | api-version |
|---|---|
| `connectionData` | `7.1-preview.1` |
| Projetos, times, work items, PRs, builds | `7.1` |

`connectionData` com `7.1` retorna 400; a versão preview é obrigatória.

## Endpoints

### 1. Identidade

`GET /connectionData?api-version=7.1-preview.1`

- Campos: `authenticatedUser.id`, `authenticatedUser.providerDisplayName`.
- `authenticatedUser` ausente ou `Anonymous` → `CFG-003`.

### 2. Area path do time

`GET /{projectId}/{teamId}/_apis/work/teamsettings/teamfieldvalues?api-version=7.1`

- Usar o primeiro `values[].value`.
- `includeChildren=true` → `[System.AreaPath] UNDER '<valor>'`; caso contrário `=`.
- Sem valores ou falha → seguir apenas com o projeto e registrar fallback.

### 3. Work items atribuídos

`POST /{projectId}/_apis/wit/wiql?api-version=7.1`

```json
{
  "query": "SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project AND [System.AssignedTo] = @Me AND [System.State] NOT IN ('Closed', 'Done', 'Removed') ORDER BY [System.ChangedDate] DESC"
}
```

Com time:

```sql
AND [System.AreaPath] UNDER '<areaPath>'
```

Resposta: `workItems[].id` (até 3).

`GET /_apis/wit/workitems?ids=1,2,3&fields=System.Id,System.WorkItemType,System.Title,System.State,System.TeamProject,System.AssignedTo,System.ChangedDate&api-version=7.1`

- `System.AssignedTo` pode ser objeto; usar `displayName`.
- URL: `https://dev.azure.com/{org}/{project}/_workitems/edit/{id}`.

### 4. Pull request que precisa de atenção

`GET /{projectId}/_apis/git/pullrequests?searchCriteria.status=active&searchCriteria.reviewerId={userId}&$top=10&api-version=7.1`

- Filtrar `reviewers[]` do usuário; voto `10` (aprovado) é excluído.
- Ordenar por `creationDate DESC`; usar o primeiro.
- URL: `_links.web.href`.
- Fallback: se `reviewerId` não filtrar, buscar `$top=50` e filtrar localmente.

### 5. Pipeline recente

`GET /{projectId}/_apis/build/builds?$top=1&queryOrder=finishTimeDescending&api-version=7.1`

- Nome: `definition.name`.
- Status: `status` + `result`.
- Data: `startTime` ou `queueTime`.
- URL: `_links.web.href`.

## Mapeamento

| Origem | Destino |
|---|---|
| `System.WorkItemType` | `type` |
| `System.Title` | `title` |
| `System.State` | `state` |
| `System.TeamProject` | `project` |
| `System.AssignedTo.displayName` | `assignedTo` |
| `System.ChangedDate` | `changedAt` |
| `pullRequestId` | `id` |
| `creationDate` | `createdAt` |
| `definition.name` | `name` |
| `startTime` / `queueTime` | `startedAt` |
| `_links.web.href` | `url` |

## Links

- Aceitar somente `https://dev.azure.com/...` e `https://*.visualstudio.com/...`.
- Abrir com `shell.openExternal` no processo principal.
- Rejeitar `javascript:`, `file:`, `data:` e hosts desconhecidos.

## Erros

| HTTP | Código | Ação |
|---|---|---|
| 401 / 203 / HTML de login | `CFG-003` | Informar token inválido |
| 403 | `CFG-004` | Informar falta de permissão |
| 404 | `CFG-009` | Projeto/recurso não encontrado |
| 429 | `CFG-006` | Respeitar `Retry-After` |
| 5xx | `CFG-007` | Retry limitado |
| rede/timeout | `CFG-005` | Usar cache e indicar staleness |
| outro | `CFG-008` | Erro inesperado com diagnóstico |

## Proibições

- Nenhum `PUT`, `PATCH` ou `DELETE`.
- Nenhum `POST` fora do WIQL de consulta.
- Nenhum PAT em URL, query, log ou resposta IPC.
- Nenhuma consulta sem `api-version`.
