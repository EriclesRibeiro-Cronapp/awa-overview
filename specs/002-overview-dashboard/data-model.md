# Data Model — Tela Overview

## Contexto

`OverviewContext` identifica o recorte exibido. A organização vem da configuração;
projeto e time vêm da seleção persistida da feature 001.

| Campo | Tipo | Regra |
|---|---|---|
| `organization` | string | Obrigatório; normalizado |
| `projectId` | string | Obrigatório; GUID ou nome estável do projeto |
| `projectName` | string | Obrigatório para exibição |
| `teamId` | string \| null | Opcional |
| `teamName` | string \| null | Obrigatório quando `teamId` existe |

`contextKey = organization + "|" + projectId + "|" + (teamId ?? "")`.

## Entidades de exibição

### WorkItemSummary

| Campo | Tipo | Regra |
|---|---|---|
| `id` | number | Inteiro positivo |
| `type` | string | Ex.: Bug, PBI, Task |
| `title` | string | Não vazio; truncado visualmente |
| `state` | string | Estado do Azure DevOps |
| `project` | string | Nome do projeto |
| `assignedTo` | string \| null | Nome de exibição |
| `changedAt` | string | ISO 8601; fallback textual se inválido |
| `url` | string | HTTPS em `dev.azure.com` ou `*.visualstudio.com` |

### PullRequestSummary

| Campo | Tipo | Regra |
|---|---|---|
| `id` | number | Inteiro positivo |
| `title` | string | Não vazio |
| `status` | string | Rótulo localizado: "Aguardando aprovação", "Rascunho", "Ativo" |
| `project` | string | Nome do projeto |
| `createdAt` | string | ISO 8601 |
| `url` | string | HTTPS permitido |

### PipelineRunSummary

| Campo | Tipo | Regra |
|---|---|---|
| `id` | number | Inteiro positivo |
| `name` | string | Nome da definição |
| `result` | `succeeded` \| `failed` \| `partiallySucceeded` \| `canceled` \| `unknown` | Resultado |
| `status` | `completed` \| `inProgress` \| `notStarted` \| `unknown` | Situação |
| `project` | string | Nome do projeto |
| `startedAt` | string \| null | ISO 8601; usa `queueTime` quando não iniciado |
| `url` | string | HTTPS permitido |

## Resultado por card

```text
CardResult<T> =
  | { ok: true;  data: T; stale: boolean; fetchedAt: string }
  | { ok: false; error: AppError; stale?: boolean; fetchedAt?: string }
```

- `stale=true` indica conteúdo do cache exibido após falha ou cache vencido.
- `ok=false` só ocorre quando não há dado cacheado para aquele card.
- Cada card tem estado independente; um erro não invalida os demais.

## OverviewView

| Campo | Tipo | Regra |
|---|---|---|
| `context` | `OverviewContext \| null` | `null` quando não há projeto selecionado |
| `workItems` | `CardResult<WorkItemSummary[]>` | Até 3 itens |
| `pullRequest` | `CardResult<PullRequestSummary \| null>` | Até 1 item |
| `pipeline` | `CardResult<PipelineRunSummary \| null>` | Até 1 item |
| `fetchedAt` | string \| null | Maior instante entre os cards bem-sucedidos |
| `stale` | boolean | `true` se qualquer card estiver stale |

`OverviewLoadResult = { ok: true; data: OverviewView } | { ok: false; error: AppError }`.

## Snapshot de cache

Arquivo `overview-cache.json.enc`, schema `1`, TTL `300` segundos.

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
| `workItems` | WorkItemSummary[] |
| `pullRequest` | PullRequestSummary \| null |
| `pipeline` | PipelineRunSummary \| null |

Regras:

- Snapshot só é usado se `contextKey` e `organization` coincidirem.
- `isFresh` compara `fetchedAt` com `ttlSeconds`.
- Cache corrompido, schema desconhecido ou chave indisponível → tratar como ausente.
- Remoção/troca de organização limpa o snapshot.

## Estados

```text
idle
  → loading (contexto válido)
  → success (cache fresco ou consulta concluída)
  → stale-success (falha com cache disponível)
  → error (falha sem cache)

success/stale-success
  → refreshing (force=true)
  → success/stale-success/error

contexto alterado
  → descartar resposta anterior e reiniciar
```

## Regras de consulta

- Work items: até 3; `AssignedTo = @Me`; estados `Closed`, `Done` e `Removed`
  excluídos; ordenação `ChangedDate DESC`; time aplicado por area path quando
  disponível.
- Pull request: até 1; status `active`; revisor = usuário autenticado; voto do
  usuário diferente de `10` (aprovado); ordenação `creationDate DESC`.
- Pipeline: até 1; `queryOrder=finishTimeDescending`; qualquer resultado.
- Links sempre HTTPS e restritos aos hosts do Azure DevOps.
- Nenhum campo de PAT, token ou credencial faz parte do modelo.
