# Data Model — Radix UI e Overview com 10 itens

## OverviewView (v2)

Substitui os campos singulares `pullRequest`/`pipeline` por arrays.

| Campo | Tipo | Regra |
|---|---|---|
| `context` | `OverviewContext \| null` | Contexto atual |
| `workItems` | `CardResult<WorkItemSummary[]>` | Até 10 itens |
| `pullRequests` | `CardResult<PullRequestSummary[]>` | Até 10 itens |
| `pipelines` | `CardResult<PipelineRunSummary[]>` | Até 10 itens |
| `fetchedAt` | `string \| null` | Instante da coleta |
| `stale` | `boolean` | Cache exibido após falha |

Cada card mantém estados independentes de loading/erro/stale.

## WorkItemSummary

| Campo | Tipo | Regra |
|---|---|---|
| `id` | number | ID do work item |
| `type` | string | Bug/PBI/Task etc. |
| `title` | string | Título |
| `state` | string | Estado |
| `project` | string | Projeto |
| `assignedTo` | string \| null | Responsável |
| `changedAt` | string | ISO 8601 |
| `priority` | number \| null | `Microsoft.VSTS.Common.Priority`; usado na ordenação |
| `url` | string | HTTPS permitido |

Ordenação: prioridade numérica crescente (1 primeiro); itens sem prioridade usam
`changedAt` descendente como fallback.

## PullRequestSummary

Mantém os campos atuais; até 10 itens por Overview. "Relacionado ao usuário" =
revisor ou autor. Ordenação por `createdAt` descendente.

## PipelineRunSummary

Mantém os campos atuais; até 10 itens por Overview. Ordenação por `startedAt`
descendente.

## OverviewSnapshot v2

`schemaVersion: 2`; o cache v1 é ignorado e recriado.

| Campo | Tipo |
|---|---|
| `schemaVersion` | 2 |
| `contextKey` | string |
| `organization` | string |
| `projectId` | string |
| `projectName` | string |
| `teamId` | string \| null |
| `teamName` | string \| null |
| `fetchedAt` | string |
| `ttlSeconds` | number |
| `workItems` | WorkItemSummary[] |
| `pullRequests` | PullRequestSummary[] |
| `pipelines` | PipelineRunSummary[] |

## HoverCardCopy

Constante editorial, sem interpolação de quantidade:

| Card | Texto fixo |
|---|---|
| Work items | `Últimos 10 work items associados a você por prioridade` |
| Pipelines | `Últimos 10 pipelines ordenado por data de inicialização.` |
| Pull requests | `Últimos 10 pull requests relacionados a você.` |

O texto permanece com “10” mesmo quando o array tem 0, 1 ou 9 itens.

## Wrappers Radix

| Wrapper | Responsabilidade |
|---|---|
| `RadixDialog` | Portal/overlay/content/título/fechamento; mantém a API de `Modal` |
| `RadixHoverCard` | Trigger focável, portal e conteúdo textual |
| `RadixScrollArea` | Viewport/scrollbar do corpo do card |
| `RadixSelect` | Trigger, portal, itens e sentinela `__all__` |
| `RadixSeparator` | Separador horizontal decorativo de 1px |
| `RadixTabs` | Root/List/Trigger/Content; valor controlado |
| `RadixTooltip` | Primitive disponível, sem triggers nesta feature |

## Regras de migração

- Os componentes atuais continuam sendo a API pública; Radix fica encapsulado.
- Nenhum valor visual novo: classes/tokens atuais.
- Portais acima do titlebar/footer/overlay; controles com `no-drag`.
- Select não recebe valor vazio; `__all__` é mapeado para “todos”.
- Scroll Area mantém o tamanho do card e esconde a barra visual quando necessário.
- Tooltip não cria UI até existir um local mapeado.
