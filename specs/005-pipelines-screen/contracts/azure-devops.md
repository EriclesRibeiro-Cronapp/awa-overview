# Contrato — Azure DevOps para Pipelines

## Execuções

`GET /{projectId}/_apis/build/builds?$top=500&queryOrder=finishTimeDescending&api-version=7.1`

Campos: `id`, `buildNumber`, `status`, `result`, `startTime`, `finishTime`,
`queueTime`, `definition.id`, `definition.name`, `project.name`, `_links.web.href`.

- Limite 500; `truncated` se houver mais.
- Escopo do projeto; time não se aplica.

## Definições

`GET /{projectId}/_apis/build/definitions?api-version=7.1`

- Mapear `id` → `description`; usar como Detalhes.
- Fallback: `buildNumber`; depois `—`.

## Status

| result/status | Ícone | Texto |
|---|---|---|
| succeeded | checkbox-circle-line | Sucesso |
| failed | close-circle-line | Falha |
| partiallySucceeded | spam-line | Parcial |
| canceled | subtract-line | Cancelado |
| inProgress | refresh-line | Em andamento |
| notStarted | timer-line | Na fila |
| outro | spam-line | Desconhecido |

## Duração

- `finishTime - startTime` em segundos.
- `Xs` até 59; `Xm Ys` acima; sem fim → `—`.

## Identidade e escopos

- `connectionData` antes da lista; 401 com identidade válida → `CFG-004`
  (escopo Build); 401 na identidade → `CFG-003`.

## Links

- `_links.web.href`; allowlist `dev.azure.com`/`*.visualstudio.com`.

## Proibições

- Nenhuma escrita de build (sem POST/PUT/PATCH/DELETE).
- Nenhum PAT em URL/log/resposta.
