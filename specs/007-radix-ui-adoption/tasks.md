# Tasks: Adoção do Radix UI e Overview com 10 itens

**Input**: `specs/007-radix-ui-adoption/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: obrigatórios nesta feature (spec e plano exigem unit/RTL, contrato, e2e e axe).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dependências Radix, documentação e classes de camada.

- [X] T001 Adicionar as dependências Radix (`@radix-ui/react-dialog`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-tabs`, `@radix-ui/react-hover-card`, `@radix-ui/react-tooltip`) em `package.json` e `package-lock.json`; Hover Card e Tooltip ficam apenas instalados, sem integração.
- [X] T002 [P] Criar a ADR `docs/adr/0012-radix-ui-incremental.md` e atualizar `docs/adr/README.md` com a decisão.
- [X] T003 [P] Adicionar classes de portal/z-index e `no-drag` em `src/renderer/styles/global.css`, sem alteração visual.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: base compartilhada dos wrappers e dos testes Radix.

- [X] T004 [P] Adicionar suporte a portais Radix no setup de testes em `tests/setup.ts` (ResizeObserver, scrollIntoView e foco).
- [X] T005 [P] Criar `src/renderer/components/radix/portal.tsx` com o portal compartilhado acima do titlebar/overlay.
- [X] T006 Criar `src/renderer/components/radix/index.ts` como barrel público dos wrappers.

**Checkpoint**: dependências, portal e setup de testes prontos.

---

## Phase 3: User Story 1 — Migrar Dialog, Select, Tabs e Separator (Priority: P1) 🎯 MVP

**Goal**: substituir os controles atuais por Radix sem alterar o visual.

**Independent Test**: abrir modais, usar todos os selects, navegar pelas abas e comparar os separadores com os snapshots existentes.

### Tests for User Story 1

- [X] T007 [P] [US1] Testar foco, ESC, restauração e fechamento do Dialog em `tests/unit/radix-dialog.test.tsx`.
- [X] T008 [P] [US1] Testar opções, sentinela `__all__`, teclado e persistência do Select em `tests/unit/radix-select.test.tsx`.
- [X] T009 [P] [US1] Testar aba ativa e navegação por setas do Tabs em `tests/unit/radix-tabs.test.tsx`.
- [X] T010 [P] [US1] Testar Separator horizontal, 1px e token atual em `tests/unit/radix-separator.test.tsx`.

### Implementation for User Story 1

- [X] T011 [US1] Implementar `src/renderer/components/radix/dialog.tsx` e substituir o interior de `src/renderer/components/Modal.tsx`, preservando a API atual.
- [X] T012 [US1] Implementar `src/renderer/components/radix/select.tsx` e migrar `src/renderer/features/projects/project-selector.tsx`, `src/renderer/features/projects/team-selector.tsx`, `src/renderer/features/work-items/work-items-filter-bar.tsx` e `src/renderer/features/pull-requests/pull-requests-filter-bar.tsx`.
- [X] T013 [US1] Implementar `src/renderer/components/radix/tabs.tsx` e refatorar `src/renderer/features/shell/product-tabs.tsx`, `src/renderer/features/shell/product-shell.tsx` e `src/renderer/features/shell/configured-app.tsx` para Root/List/Trigger/Content.
- [X] T014 [US1] Implementar `src/renderer/components/radix/separator.tsx` e usá-lo em `src/renderer/features/overview/card-shell.tsx`.
- [X] T015 [US1] Ajustar CSS dos wrappers em `src/renderer/styles/global.css` para paridade visual e portais acima do titlebar.
- [X] T016 [US1] Atualizar os testes existentes afetados:
  `tests/unit/config-modal.test.tsx`, `tests/unit/work-items-filters.test.tsx`,
  `tests/unit/pull-requests-filters.test.tsx`, `tests/e2e/config.spec.ts`,
  `tests/e2e/projects.spec.ts`, `tests/e2e/work-items.spec.ts`,
  `tests/e2e/pull-requests.spec.ts` e `tests/e2e/window-header.spec.ts`.
- [X] T017 [US1] Adicionar e2e de Dialog, Select, Tabs e Separator em `tests/e2e/radix-controls.spec.ts`.
- [X] T018 [US1] Adicionar e2e de camadas de portal (Select no footer, Dialog sobre o board e portal acima do titlebar) em `tests/e2e/radix-portals.spec.ts`.

**Checkpoint**: US1 funcional e visualmente equivalente.

---

## Phase 4: User Story 2 — Overview com até 10 itens e Scroll Area (Priority: P2)

**Goal**: carregar até 10 itens por categoria, exibir em Scroll Area e adaptar dados/cache.

**Independent Test**: com 10 itens em cada categoria, rolar cada card mantendo cabeçalho e separador fixos.

### Tests for User Story 2

- [X] T019 [P] [US2] Testar contrato IPC v2, arrays e limite de 10 em `tests/contract/overview-ipc.test.ts`.
- [X] T020 [P] [US2] Testar seleção dos 10 mais recentes, prioridade, PRs relacionados e pipelines em `tests/unit/azure-devops-overview-ten.test.ts`.
- [X] T021 [P] [US2] Testar cache `schemaVersion: 2` e serviço com arrays em `tests/unit/overview-service.test.ts` e `tests/unit/overview-cache.test.ts`.
- [X] T022 [P] [US2] Testar Scroll Area com 10 itens em `tests/unit/radix-scroll-area.test.tsx`.

### Implementation for User Story 2

- [X] T023 [US2] Atualizar `src/shared/contracts/index.ts`: `OverviewView` com `workItems[]`, `pullRequests[]` e `pipelines[]` de até 10 itens e `WorkItemSummary.priority`.
- [X] T024 [US2] Atualizar `src/main/services/azure-devops-client.ts`: selecionar os **10 mais recentes** work items atribuídos por `ChangedDate`, depois ordenar por prioridade; buscar até 10 PRs relacionados (revisor/autor) e até 10 pipelines por `startedAt`.
- [X] T025 [US2] Atualizar `src/main/services/overview-cache-service.ts` e `src/main/services/overview-service.ts` para `schemaVersion: 2` e arrays de até 10 itens.
- [X] T026 [US2] Atualizar `src/main/ipc/handlers.ts` e `src/preload/index.ts` para o novo shape do Overview.
- [X] T027 [US2] Implementar `src/renderer/components/radix/scroll-area.tsx` com viewport, barra oculta e rolagem por teclado.
- [X] T028 [US2] Atualizar `src/renderer/features/overview/overview-screen.tsx`, `src/renderer/features/overview/work-items-card.tsx`, `src/renderer/features/overview/pull-request-card.tsx` e `src/renderer/features/overview/pipeline-card.tsx` para arrays de até 10 itens com Scroll Area.
- [X] T029 [US2] Atualizar estados vazios/erro/plural e textos em `src/renderer/i18n/pt-BR.ts`.
- [X] T030 [US2] Adicionar e2e de 10 itens e rolagem em `tests/e2e/overview-ten-items.spec.ts`.

**Checkpoint**: Overview com até 10 itens, cache v2 e Scroll Area.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T031 [P] Atualizar `docs/design/gaps.md`, `docs/security/review.md` e `specs/007-radix-ui-adoption/quickstart.md` com o resultado da migração; registrar que Hover Card e Tooltip ficam para feature futura.
- [X] T032 [P] Adicionar auditoria axe dos novos fluxos em `tests/e2e/radix-a11y.spec.ts`.
- [X] T033 [P] Atualizar, somente se inevitável, os snapshots visuais:
  `tests/e2e/visual.spec.ts-snapshots/config-first-run-win32.png`,
  `tests/e2e/overview-visual.spec.ts-snapshots/overview-filled-win32.png`,
  `tests/e2e/work-items.spec.ts-snapshots/work-items-filled-win32.png`,
  `tests/e2e/pull-requests.spec.ts-snapshots/pull-requests-filled-win32.png`,
  `tests/e2e/pipelines.spec.ts-snapshots/pipelines-filled-win32.png`.
- [X] T034 [P] Adicionar teste de performance com 10 itens/scroll em `tests/e2e/overview-radix-performance.spec.ts`.
- [X] T035 Rodar `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:coverage`, `npm run build` e `npm run test:e2e` usando os scripts de `package.json`.
- [X] T036 Fazer o commit da feature 007 e atualizar `specs/007-radix-ui-adoption/tasks.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; bloqueia os wrappers.
- **US1 (Phase 3)**: depende da Foundational; é o MVP.
- **US2 (Phase 4)**: depende da Foundational; preferencialmente após US1 para evitar conflito nos cards/estilos.
- **Polish (Phase 5)**: depende de US1 e US2.

### User Story Dependencies

- **US1**: migração visual; sem dependência de dados.
- **US2**: dados/cache/cards; depende da base Radix e de `card-shell` da US1.
- Hover Card e Tooltip não têm fase de implementação nesta feature; apenas T001.

### Parallel Opportunities

- T002 e T003 em paralelo.
- T004 e T005 em paralelo.
- Testes T007–T010 em paralelo; implementações T011–T014 em arquivos diferentes.
- Testes T019–T022 em paralelo.
- T031–T034 em paralelo.

---

## Parallel Example: User Story 1

```bash
Task: "Testar foco, ESC, restauração e fechamento do Dialog em tests/unit/radix-dialog.test.tsx"
Task: "Testar opções, sentinela __all__, teclado e persistência do Select em tests/unit/radix-select.test.tsx"
Task: "Testar aba ativa e navegação por setas do Tabs em tests/unit/radix-tabs.test.tsx"
Task: "Testar Separator horizontal, 1px e token atual em tests/unit/radix-separator.test.tsx"
```

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational.
2. Implementar US1: Dialog, Select, Tabs e Separator.
3. Validar visualmente e por teclado.
4. Rodar snapshots/axe antes de seguir.

### Incremental Delivery

1. US1 — migração invisível dos controles.
2. US2 — 10 itens por categoria + Scroll Area.
3. Polish — docs, a11y, snapshots, performance e validação completa.

---

## Notes

- [P] = arquivos diferentes, sem dependência.
- Testes antes da implementação.
- Não alterar layout, cores, tipografia, ícones, titlebar, footer ou janela 900×700.
- 10 work items = **10 mais recentes atribuídos** por `ChangedDate`, depois ordenados
  por prioridade.
- "Relacionado a você" para PRs = revisor ou autor.
- Hover Card e Tooltip são apenas dependências instaladas; nenhum trigger/wrapper.
- Cache de Overview v1 deve ser descartado; v2 é o novo formato.
