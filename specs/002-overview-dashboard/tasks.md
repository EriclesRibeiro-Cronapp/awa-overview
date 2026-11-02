# Tasks: Tela Overview — visão consolidada de trabalho

**Input**: Design documents from `specs/002-overview-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: obrigatórios nesta feature (constituição VIII). Escrever os testes antes
da implementação correspondente.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar contratos, ícones, textos e componentes reutilizáveis.

- [X] T001 [P] Copiar SVGs de `docs/design/assets/icons/` para `src/renderer/assets/icons/` e criar o mapa de ícones em `src/renderer/assets/icons/index.ts` com `currentColor`.
- [X] T002 [P] Adicionar textos do Overview e do shell em `src/renderer/i18n/pt-BR.ts`.
- [X] T003 [P] Criar componente `Tab`/`TabList` acessível em `src/renderer/components/Tabs.tsx` e exportar em `src/renderer/components/index.ts`.
- [X] T004 [P] Adicionar tipos do Overview em `src/shared/contracts/index.ts` (`WorkItemSummary`, `PullRequestSummary`, `PipelineRunSummary`, `OverviewContext`, `OverviewView`, `CardResult`, `OverviewLoadResult`).
- [X] T005 [P] Atualizar ADR-0011, ADR-0005 e contratos da feature 001 sobre `connectionData` preview e WIQL read-only.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestrutura compartilhada por todas as histórias.

**⚠️ CRITICAL**: nenhuma história começa antes desta fase.

- [X] T006 Extrair `EncryptedJsonStore<T>` em `src/main/services/encrypted-json-store.ts` e refatorar `src/main/services/cache-service.ts` para usá-lo sem mudar o formato do cache existente.
- [X] T007 [P] Criar `src/main/services/overview-cache-service.ts` com snapshot cifrado, TTL de 300s e `clear()`.
- [X] T008 [P] Estender `src/main/services/azure-devops-client.ts` com identidade (`authenticatedUser.id`), area path do time e métodos de work items/PR/build.
- [X] T009 Criar `src/main/services/overview-service.ts` com contexto, cache, execução paralela e resultado por card.
- [X] T010 Adicionar `overview:load` em `src/main/ipc/handlers.ts`, expor `window.api.overview.load` em `src/preload/index.ts` e registrar dependências em `src/main/index.ts`.
- [X] T011 Criar hook `src/renderer/features/shell/use-project-context.ts` para carregar projetos/times, persistir seleção e expor o contexto atual.
- [X] T012 Criar `src/renderer/features/shell/product-shell.tsx` e `product-tabs.tsx` com cabeçalho, seletores, divisor, abas e rodapé.
- [X] T013 Integrar o shell em `src/renderer/app.tsx`, substituindo o `ProjectsPanel` por `ProductShell` + `OverviewScreen`, mantendo configuração e primeiro uso.
- [X] T014 [P] Adicionar testes de contrato básicos em `tests/contract/overview-ipc.test.ts` para configuração ausente, projeto ausente e cache.
- [X] T015 [P] Adicionar testes unitários do `EncryptedJsonStore` e do `OverviewCacheService` em `tests/unit/overview-cache.test.ts`.

**Checkpoint**: shell, contratos, cache e IPC prontos; histórias podem começar.

---

## Phase 3: User Story 1 — Ver meus work items (Priority: P1) 🎯 MVP

**Goal**: shell + card de work items com dados reais, estados vazio/erro/carregando.

**Independent Test**: com configuração e projeto/time, abrir o app e ver o Overview
com até 3 work items atribuídos ao usuário ou a mensagem vazia.

### Tests for User Story 1

- [X] T016 [P] [US1] Teste unitário do WIQL e do mapeamento de work items em `tests/unit/azure-devops-work-items.test.ts`.
- [X] T017 [P] [US1] Teste de integração do Overview com work items e cache em `tests/integration/overview-work-items.test.ts`.
- [X] T018 [P] [US1] Teste de componente do card de work items em `tests/unit/work-items-card.test.tsx`.

### Implementation for User Story 1

- [X] T019 [US1] Implementar `listAssignedWorkItems` e `getTeamAreaPath` no client com escopo de projeto/time e limite de 3.
- [X] T020 [US1] Implementar o card de work items em `src/renderer/features/overview/work-items-card.tsx` com tipo, ID, título, status, projeto, responsável e link.
- [X] T021 [US1] Implementar `src/renderer/features/overview/overview-screen.tsx` com grid de cards e estados independentes.
- [X] T022 [US1] Implementar `src/renderer/features/overview/use-overview.ts` com TanStack Query, chave por contexto e `overview.load`.
- [X] T023 [US1] Adicionar orientação de projeto/time ausente e estados de carregamento/erro/vazio no card.
- [X] T024 [US1] Adicionar e2e do Overview vazio e preenchido em `tests/e2e/overview-work-items.spec.ts` com IPC sobrescrito.

**Checkpoint**: US1 funcional e testável isoladamente.

---

## Phase 4: User Story 2 — Pull requests e pipelines (Priority: P2)

**Goal**: completar os cards de PR e pipeline com links externos.

**Independent Test**: com PR aguardando revisão e execução recente, ver os dois
cards e abrir os links no navegador.

### Tests for User Story 2

- [X] T025 [P] [US2] Teste unitário do filtro de PR por revisor/voto em `tests/unit/azure-devops-pull-requests.test.ts`.
- [X] T026 [P] [US2] Teste unitário do mapeamento de builds em `tests/unit/azure-devops-pipelines.test.ts`.
- [X] T027 [P] [US2] Teste de componente dos cards de PR e pipeline em `tests/unit/overview-cards.test.tsx`.
- [X] T028 [P] [US2] Teste de contrato do link externo e allowlist em `tests/contract/external-links.test.ts`.

### Implementation for User Story 2

- [X] T029 [US2] Implementar `getPullRequestNeedingAttention` no client com identidade, filtro de voto e fallback local.
- [X] T030 [US2] Implementar `getLatestPipelineRun` no client com status, resultado, data e URL.
- [X] T031 [US2] Integrar PR e pipeline ao `OverviewService` e ao resultado por card.
- [X] T032 [US2] Implementar `pull-request-card.tsx` e `pipeline-card.tsx` conforme o design.
- [X] T033 [US2] Implementar abertura segura de links externos via `shell.openExternal` e allowlist de hosts.
- [X] T034 [US2] Adicionar e2e dos cards de PR/pipeline em `tests/e2e/overview-cards.spec.ts`.

**Checkpoint**: US1 e US2 funcionam juntas e isoladamente.

---

## Phase 5: User Story 3 — Atualizar e reconhecer staleness (Priority: P3)

**Goal**: atualização manual, cache de 5 minutos, indicador de desatualizado e
recuperação offline.

**Independent Test**: acionar "Atualizar", ver o horário mudar; simular cache vencido
e falha de rede e ver o conteúdo antigo com aviso.

### Tests for User Story 3

- [X] T035 [P] [US3] Teste de TTL, `force` e fallback para cache em `tests/unit/overview-service.test.ts`.
- [X] T036 [P] [US3] Teste de concorrência e troca de contexto em `tests/integration/overview-context.test.ts`.
- [X] T037 [P] [US3] Teste de staleness e offline em `tests/integration/overview-stale.test.ts`.

### Implementation for User Story 3

- [X] T038 [US3] Implementar rodapé com `Atualizado em`, indicador de stale e botão "Atualizar" com estado de carregamento.
- [X] T039 [US3] Implementar descarte de respostas de contexto antigo e bloqueio de refresh duplicado.
- [X] T040 [US3] Limpar o cache do Overview na troca de organização e na remoção da configuração.
- [X] T041 [US3] Adicionar e2e de staleness/offline e de atualização manual em `tests/e2e/overview-refresh.spec.ts`.

**Checkpoint**: as três histórias estão funcionais.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T042 [P] Atualizar `docs/design/gaps.md`, `docs/security/review.md` e `specs/002-overview-dashboard/quickstart.md` com o resultado da implementação.
- [X] T043 [P] Adicionar auditoria axe da tela Overview em `tests/e2e/overview-a11y.spec.ts` e corrigir violações.
- [X] T044 [P] Adicionar snapshot visual do Overview preenchido em `tests/e2e/overview-visual.spec.ts`.
- [X] T045 [P] Adicionar teste de performance do Overview com cache e com rede em `tests/e2e/overview-performance.spec.ts`.
- [X] T046 Revisar logs/redaction: nenhum PAT, header ou URL sensível em `overview:load`.
- [X] T047 Rodar `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:coverage`, `npm run build` e `npm run test:e2e`.
- [X] T048 Fazer commit da feature 002 e atualizar `specs/002-overview-dashboard/tasks.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da Foundational.
- **US2 (Phase 4)**: depende da Foundational; integra com US1.
- **US3 (Phase 5)**: depende da Foundational e dos cards de US1/US2.
- **Polish (Phase 6)**: depende das três histórias.

### User Story Dependencies

- **US1**: entrega o MVP (shell + work items).
- **US2**: adiciona PR e pipeline; pode começar após a Foundational, mas o e2e
  conjunto depende de US1.
- **US3**: depende dos cards para exibir stale/refresh.

### Parallel Opportunities

- T001–T005 em paralelo.
- T006–T008 em paralelo; T009 depende deles.
- Testes de cada história marcados [P] podem ser escritos em paralelo.
- Cards de PR e pipeline podem ser implementados em paralelo após T009.

---

## Implementation Strategy

### MVP First

1. Phase 1 + Phase 2.
2. Phase 3 (work items).
3. Validar US1 isoladamente.
4. Seguir para US2 e US3.

### Incremental Delivery

1. Shell + work items → demo.
2. PR + pipeline → demo.
3. Refresh/staleness → demo.
4. Polish + validação completa.

---

## Notes

- [P] = arquivos diferentes, sem dependência.
- Testes antes da implementação.
- Não usar PAT em fixtures, logs ou snapshots.
- Limites do design: 3 work items, 1 PR, 1 pipeline.
- As abas Work items/Pull requests/Pipelines permanecem indisponíveis.
