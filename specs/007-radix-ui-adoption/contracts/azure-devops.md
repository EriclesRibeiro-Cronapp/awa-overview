# Contrato — Azure DevOps para Overview de 10 itens

## Work items

- WIQL no projeto/time, associado ao usuário:
  ```sql
  SELECT [System.Id] FROM WorkItems
  WHERE [System.TeamProject] = @project
    AND [System.AssignedTo] = @Me
    AND [System.State] NOT IN ('Closed', 'Done', 'Removed')
    [AND [System.AreaPath] UNDER '<areaPath>']
  ORDER BY [System.ChangedDate] DESC
  ```
- Campo adicional: `Microsoft.VSTS.Common.Priority`.
- Selecionar os **10 primeiros IDs** por `ChangedDate` descendente; lote de detalhes
  existente.
- Depois, ordenar esses 10 por prioridade numérica crescente (1 primeiro); itens sem
  prioridade/0 vão para o fim, com fallback `ChangedDate DESC`.

## Pull requests

- Buscar PRs ativos do projeto com `$top=100` e filtrar no cliente:
  - `createdBy.id === usuário` ou
  - `reviewers[].id === usuário`.
- Ordenar por `creationDate DESC`; usar os 10 primeiros.
- Campos: `pullRequestId`, `title`, `status`, `creationDate`,
  `repository.project.name`, `_links.web.href`.
- Reutilizar identidade de `connectionData`.
- **Rationale**: a API não combina autor+revisor em um único filtro; 100 candidatos
  cobrem o recorte operacional sem múltiplas chamadas.

## Pipelines

- `GET /{projectId}/_apis/build/builds?$top=10&queryOrder=startTimeDescending&api-version=7.1`.
- Se `startTimeDescending` não for aceito, buscar `$top=20` e ordenar por
  `startTime`/`queueTime` desc no cliente.
- Mapear os 10 primeiros; manter descrição de definição/cache atual.
- Campos: `id`, `buildNumber`, `status`, `result`, `startTime`, `finishTime`,
  `definition.id/name`, `project.name`, `_links.web.href`.

## Cache

- `overview-cache.json.enc`, schema 2, TTL 300s.
- Arrays de até 10 itens; snapshot v1 descartado.
- Invalidação por organização/contexto/remoção permanece.

## Erros

- 401 após identidade válida → `CFG-004` (escopo).
- 401 na identidade → `CFG-003`.
- Erros por categoria não derrubam as demais; fallback de cache stale quando
  disponível.

## Proibições

- Nenhuma escrita no Azure DevOps.
- Nenhum PAT em URL/log/resposta.
- Nenhuma consulta sem `api-version`.
