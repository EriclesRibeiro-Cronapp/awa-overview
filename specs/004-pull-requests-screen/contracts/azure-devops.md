# Contrato — Azure DevOps para Pull requests

## Endpoint

`GET /{projectId}/_apis/git/pullrequests?searchCriteria.status=all&$top=1000&api-version=7.1`

- Escopo do projeto; time não se aplica.
- Retorno: `value[]` com `pullRequestId`, `title`, `status`, `creationDate`,
  `repository.project.name`, `_links.web.href`.
- Ordenar por `creationDate` desc.
- Limite 1.000; `truncated` se houver mais.

## Identidade e escopos

- Antes da lista, chamar `connectionData` (`7.1-preview.1`) para validar a
  identidade.
- 401 após identidade válida → `CFG-004` (falta de escopo Code).
- 401 na identidade → `CFG-003`.

## Status

| API | Texto |
|---|---|
| `active` | Aberto |
| `completed` | Concluído |
| `abandoned` | Abandonado |

## Links

- Usar `_links.web.href`; fallback construir URL com projeto/repositório/ID.
- Permitir somente HTTPS em `dev.azure.com`/`*.visualstudio.com`.

## Erros

Mesmo catálogo das features anteriores; timeout 15s, retry em 429/5xx.

## Proibições

- Nenhuma escrita de PR (sem POST/PUT/PATCH/DELETE).
- Nenhum PAT em URL/log/resposta.
