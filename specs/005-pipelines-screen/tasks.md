# Tasks: Tela Pipelines

**Input**: `specs/005-pipelines-screen/`

**Tests**: obrigatórios (constituição VIII).

## Phase 1: Setup

- [X] T001 [P] Adicionar tipos e canal `pipelines` em `src/shared/contracts/index.ts`.
- [X] T002 [P] Adicionar textos e labels de status em `src/shared/pipelines.ts` e `src/renderer/i18n/pt-BR.ts`.
- [X] T003 [P] Registrar ausência de screenshot e correção de cor em `docs/design/gaps.md`.

## Phase 2: Foundational

- [X] T004 Estender `azure-devops-client.ts` com `listPipelines` (builds + definitions, limite 500, duração).
- [X] T005 [P] Criar `pipelines-cache-service.ts` com `EncryptedJsonStore`, TTL 300s.
- [X] T006 Criar `pipelines-service.ts` com cache, staleness e 401 → `CFG-004`.
- [X] T007 Adicionar `pipelines:load` no IPC, preload e composition root.
- [X] T008 [P] Criar `tests/contract/pipelines-ipc.test.ts`.
- [X] T009 [P] Criar `tests/unit/pipelines-cache.test.ts`.
- [X] T010 Habilitar a aba Pipelines em `ProductTabs`/`ConfiguredApp`.

## Phase 3: User Story 1 — Consultar execuções (P1) 🎯 MVP

- [X] T011 [P] [US1] Teste do cliente (builds/definitions/duração) em `tests/unit/azure-devops-pipelines-list.test.ts`.
- [X] T012 [P] [US1] Teste de integração do serviço/cache em `tests/integration/pipelines-flow.test.ts`.
- [X] T013 [P] [US1] Teste de componente da tabela em `tests/unit/pipelines-table.test.tsx`.
- [X] T014 [US1] Implementar `pipelines-table.tsx` com 4 colunas, ícones, status, data, duração e acesso.
- [X] T015 [US1] Implementar `pipelines-page.tsx` com título, busca, tabela e estados.
- [X] T016 [US1] Implementar `use-pipelines.ts` com TanStack Query/cache.
- [X] T017 [US1] Implementar status/ícones/cores acessíveis em `src/shared/pipelines.ts`.
- [X] T018 [US1] Adicionar e2e da tabela em `tests/e2e/pipelines.spec.ts`.

## Phase 4: User Story 2 — Busca (P2)

- [X] T019 [P] [US2] Teste unitário de busca (`tests/unit/pipelines-filters.test.ts`).
- [X] T020 [P] [US2] Teste de componente da busca (`tests/unit/pipelines-filters.test.tsx`).
- [X] T021 [US2] Implementar `pipelines-filters.tsx` com busca 499px.
- [X] T022 [US2] Implementar filtragem por nome/descrição e estado sem resultados.
- [X] T023 [US2] Adicionar e2e de busca.

## Phase 5: User Story 3 — Atualizar/staleness (P3)

- [X] T024 [P] [US3] Teste de TTL/force/fallback (`tests/unit/pipelines-service.test.ts`).
- [X] T025 [US3] Reutilizar `ProductFooter` com Atualizado em/stale/Atualizar.
- [X] T026 [US3] Implementar refresh manual e bloqueio de duplicidade.
- [X] T027 [US3] Limpar o cache de pipelines na troca de organização/remoção/contexto.
- [X] T028 [US3] Adicionar e2e de staleness/refresh.

## Phase 6: Polish

- [X] T029 [P] Auditoria axe na tela.
- [X] T030 [P] Snapshot visual.
- [X] T031 [P] Teste de performance de busca com 500 execuções.
- [X] T032 Atualizar `docs/security/review.md` e quickstart.
- [X] T033 Rodar lint, typecheck, testes, cobertura, build e e2e.
- [X] T034 Commit da feature 005 e tasks marcadas.

## Dependencies

Setup → Foundational → US1 → US2 → US3 → Polish.
T004–T007 são pré-requisitos da tela; T010 da navegação.
