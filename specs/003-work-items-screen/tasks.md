# Tasks: Tela Work items

**Input**: `specs/003-work-items-screen/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: obrigatórios (constituição VIII). Escrever antes da implementação.

## Phase 1: Setup

- [X] T001 [P] Adicionar tipos de Work items e o canal `workItems` em `src/shared/contracts/index.ts`.
- [X] T002 [P] Adicionar textos da tela, filtros, resumo e vazio em `src/renderer/i18n/pt-BR.ts`.
- [X] T003 [P] Atualizar `docs/design/gaps.md` com a decisão G-25 e revisar `docs/design/screens.md`.
- [X] T004 [P] Revisar tokens/ícones necessários (`newspaper-line`, `filter-3-line`, `arrow-down-s-line`, `share-circle-line`) e estilos de tabela.

---

## Phase 2: Foundational

- [X] T005 Estender `src/main/services/azure-devops-client.ts` com `listWorkItems` (WIQL de todos os estados + lotes de 200 + limite 2.000).
- [X] T006 [P] Criar `src/main/services/work-items-cache-service.ts` usando `EncryptedJsonStore`, TTL 300s.
- [X] T007 Criar `src/main/services/work-items-service.ts` com resumo, cache, staleness e fallback.
- [X] T008 Adicionar `workItems:load` em `src/main/ipc/handlers.ts`, `window.api.workItems.load` no preload e dependências no `src/main/index.ts`.
- [X] T009 Extrair resolução de contexto (organização/projeto/time) para helper compartilhado em `src/main/ipc/handlers.ts`.
- [X] T010 [P] Adicionar testes de contrato do novo canal em `tests/contract/work-items-ipc.test.ts`.
- [X] T011 [P] Adicionar testes unitários do cache de Work items em `tests/unit/work-items-cache.test.ts`.
- [X] T012 Elevar `useProjectContext` para `src/renderer/features/shell/configured-app.tsx` e adaptar `src/renderer/app.tsx`.

---

## Phase 3: User Story 1 — Consultar work items (P1) 🎯 MVP

**Goal**: aba Work items com título, resumo e tabela.

- [X] T013 [P] [US1] Teste unitário do WIQL/lote/mapeamento em `tests/unit/azure-devops-work-items-list.test.ts`.
- [X] T014 [P] [US1] Teste de integração do serviço/cache em `tests/integration/work-items-flow.test.ts`.
- [X] T015 [P] [US1] Teste de componente de resumo/tabela em `tests/unit/work-items-table.test.tsx`.
- [X] T016 [US1] Implementar `work-items-summary.tsx` com Total/Backlog/Em andamento/Concluído.
- [X] T017 [US1] Implementar `work-items-table.tsx` com grid de 6 colunas, cabeçalho fixo, 3 linhas visíveis e rolagem.
- [X] T018 [US1] Implementar `work-items-page.tsx` com título, resumo, tabela e estados de loading/erro/vazio.
- [X] T019 [US1] Implementar `use-work-items.ts` com TanStack Query, chave por contexto e `workItems.load`.
- [X] T020 [US1] Habilitar a aba Work items em `ProductTabs` e navegar Overview ↔ Work items preservando o contexto.
- [X] T021 [US1] Garantir link Acessar com `share-circle-line`, allowlist e rótulo acessível.
- [X] T022 [US1] Adicionar e2e da tabela e do resumo em `tests/e2e/work-items.spec.ts`.

**Checkpoint**: US1 funcional.

---

## Phase 4: User Story 2 — Filtrar e buscar (P2)

- [X] T023 [P] [US2] Teste unitário de busca e filtros combinados em `tests/unit/work-items-filters.test.ts`.
- [X] T024 [P] [US2] Teste de componente dos filtros em `tests/unit/work-items-filters.test.tsx`.
- [X] T025 [US2] Implementar `work-items-filters.tsx` com busca, quatro selects e opções derivadas.
- [X] T026 [US2] Implementar filtragem client-side (ID/título, tipo, responsável, status, sprint) e estado sem resultados.
- [X] T027 [US2] Integrar filtros à página e garantir que o resumo não reage aos filtros.
- [X] T028 [US2] Adicionar e2e de busca/filtros em `tests/e2e/work-items-filters.spec.ts`.

**Checkpoint**: US2 funcional.

---

## Phase 5: User Story 3 — Atualizar e staleness (P3)

- [X] T029 [P] [US3] Teste de TTL/force/fallback em `tests/unit/work-items-service.test.ts`.
- [X] T030 [P] [US3] Teste de troca de contexto/cache em `tests/integration/work-items-context.test.ts`.
- [X] T031 [US3] Extrair/rodapé compartilhado (`ProductFooter`) com Atualizado em, stale e Atualizar.
- [X] T032 [US3] Implementar atualização manual e bloqueio de chamadas duplicadas em `use-work-items.ts`.
- [X] T033 [US3] Limpar o cache de Work items na troca de organização/remoção/contexto.
- [X] T034 [US3] Adicionar e2e de atualização/staleness em `tests/e2e/work-items-refresh.spec.ts`.

**Checkpoint**: as três histórias funcionam.

---

## Phase 6: Polish

- [X] T035 [P] Auditoria axe da tela Work items em `tests/e2e/work-items-a11y.spec.ts`.
- [X] T036 [P] Snapshot visual da tela em `tests/e2e/work-items-visual.spec.ts`.
- [X] T037 [P] Teste de performance de filtros com 2.000 itens em `tests/unit/work-items-filters-performance.test.ts`.
- [X] T038 Atualizar `docs/security/review.md`, `docs/design/gaps.md` e `quickstart.md` com o resultado.
- [X] T039 Rodar lint, typecheck, testes, cobertura, build e e2e.
- [X] T040 Fazer commit da feature 003 e marcar `tasks.md`.

## Dependencies

- Setup → Foundational → US1 → US2 → US3 → Polish.
- T005–T008 são pré-requisitos dos cards/tabela.
- T012 é pré-requisito da navegação.
- T031 pode ser feito junto de T018.

## Notes

- [P] = arquivos diferentes.
- Limite de 2.000 itens; lotes de 200.
- Resumo independente dos filtros.
- Tabela: 3 linhas visíveis + rolagem; sem paginação.
- Export antigo sem título/abas: análise manual prevalece (G-25).
