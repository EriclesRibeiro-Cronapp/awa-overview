# Tasks: Tela Pull requests

**Input**: `specs/004-pull-requests-screen/`

**Tests**: obrigatórios (constituição VIII).

## Phase 1: Setup

- [X] T001 [P] Adicionar tipos e canal `pullRequests` em `src/shared/contracts/index.ts`.
- [X] T002 [P] Adicionar textos da tela em `src/renderer/i18n/pt-BR.ts`.
- [X] T003 [P] Registrar a divergência de design (sem screenshot próprio) em `docs/design/gaps.md`.

## Phase 2: Foundational

- [X] T004 Estender `src/main/services/azure-devops-client.ts` com `listPullRequests` (status all, limite 1.000, ordenação).
- [X] T005 [P] Criar `src/main/services/pull-requests-cache-service.ts` com `EncryptedJsonStore`, TTL 300s.
- [X] T006 Criar `src/main/services/pull-requests-service.ts` com cache, staleness e 401 → `CFG-004`.
- [X] T007 Adicionar `pullRequests:load` no IPC, preload e composition root.
- [X] T008 [P] Criar `tests/contract/pull-requests-ipc.test.ts`.
- [X] T009 [P] Criar `tests/unit/pull-requests-cache.test.ts`.
- [X] T010 Habilitar a aba Pull requests em `ProductTabs`/`ConfiguredApp`.

## Phase 3: User Story 1 — Consultar PRs (P1) 🎯 MVP

- [X] T011 [P] [US1] Teste unitário do cliente (`tests/unit/azure-devops-pull-requests-list.test.ts`).
- [X] T012 [P] [US1] Teste de integração do serviço/cache (`tests/integration/pull-requests-flow.test.ts`).
- [X] T013 [P] [US1] Teste de componente da tabela (`tests/unit/pull-requests-table.test.tsx`).
- [X] T014 [US1] Implementar `pull-requests-table.tsx` com 4 colunas, 41px/49px, 3 linhas e rolagem.
- [X] T015 [US1] Implementar `pull-requests-page.tsx` com título, busca, tabela e estados.
- [X] T016 [US1] Implementar `use-pull-requests.ts` com TanStack Query/cache.
- [X] T017 [US1] Implementar labels de status e cores acessíveis em `src/shared/pull-requests.ts`.
- [X] T018 [US1] Adicionar link Acessar com allowlist e rótulo acessível.
- [X] T019 [US1] Adicionar e2e da tabela em `tests/e2e/pull-requests.spec.ts`.

## Phase 4: User Story 2 — Busca e status (P2)

- [X] T020 [P] [US2] Teste unitário de busca/status (`tests/unit/pull-requests-filters.test.ts`).
- [X] T021 [P] [US2] Teste de componente dos filtros (`tests/unit/pull-requests-filters.test.tsx`).
- [X] T022 [US2] Implementar `pull-requests-filters.tsx` com busca 499px e select de status.
- [X] T023 [US2] Implementar filtragem combinada e estado sem resultados.
- [X] T024 [US2] Adicionar e2e de busca/filtro.

## Phase 5: User Story 3 — Atualizar/staleness (P3)

- [X] T025 [P] [US3] Teste de TTL/force/fallback (`tests/unit/pull-requests-service.test.ts`).
- [X] T026 [US3] Reutilizar `ProductFooter` com Atualizado em/stale/Atualizar.
- [X] T027 [US3] Implementar refresh manual e bloqueio de duplicidade.
- [X] T028 [US3] Limpar o cache de PRs na troca de organização/remoção/contexto.
- [X] T029 [US3] Adicionar e2e de staleness/refresh.

## Phase 6: Polish

- [X] T030 [P] Auditoria axe em `tests/e2e/pull-requests-a11y.spec.ts`.
- [X] T031 [P] Snapshot visual da tela.
- [X] T032 [P] Teste de performance de filtros com 1.000 PRs.
- [X] T033 Atualizar `docs/security/review.md` e quickstart.
- [X] T034 Rodar lint, typecheck, testes, cobertura, build e e2e.
- [X] T035 Commit da feature 004 e tasks marcadas.

## Dependencies

Setup → Foundational → US1 → US2 → US3 → Polish.
T004–T007 são pré-requisitos da tela; T010 da navegação.
