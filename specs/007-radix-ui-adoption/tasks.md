# Tasks: Adoção do Radix UI e Overview com 10 itens

**Input**: `specs/007-radix-ui-adoption/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: obrigatórios nesta feature (spec e plano exigem unit/RTL, contrato, e2e e axe).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dependências Radix, documentação e textos fixos.

- [ ] T001 Adicionar as dependências Radix (`@radix-ui/react-dialog`, `react-hover-card`, `react-scroll-area`, `react-select`, `react-separator`, `react-tabs`, `react-tooltip`) em `package.json` e atualizar `package-lock.json`, sem Tailwind/shadcn.
- [ ] T002 [P] Criar a ADR `docs/adr/0012-radix-ui-incremental.md` e atualizar `docs/adr/README.md` com a decisão.
- [ ] T003 [P] Adicionar os textos fixos dos Hover Cards em `src/renderer/i18n/pt-BR.ts`.
- [ ] T004 [P] Adicionar classes de camada/portal (z-index e `no-drag`) em `src/renderer/styles/global.css`, sem alteração visual.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: base compartilhada dos wrappers e dos testes Radix.

- [ ] T005 [P] Adicionar suporte a portais Radix no setup de testes em `tests/setup.ts` (ResizeObserver, scrollIntoView e foco).
- [ ] T006 [P] Criar `src/renderer/components/radix/portal.tsx` com o portal compartilhado acima do titlebar/overlay.
- [ ] T007 Criar `src/renderer/components/radix/index.ts` como barrel público dos wrappers.

**Checkpoint**: dependências, portal e setup de testes prontos.

---

## Phase 3: User Story 1 — Migrar Dialog, Select, Tabs e Separator (Priority: P1) 🎯 MVP

**Goal**: substituir os controles atuais por Radix sem alterar o visual.

**Independent Test**: abrir modais, usar todos os selects, navegar pelas abas e comparar os separadores com os snapshots existentes.

### Tests for User Story 1

- [ ] T008 [P] [US1] Testar foco, ESC, restauração e fechamento do Dialog em `tests/unit/radix-dialog.test.tsx`.
- [ ] T009 [P] [US1] Testar opções, sentinela `__all__`, teclado e persistência do Select em `tests/unit/radix-select.test.tsx`.
- [ ] T010 [P] [US1] Testar aba ativa e navegação por setas do Tabs em `tests/unit/radix-tabs.test.tsx`.
- [ ] T011 [P] [US1] Testar Separator horizontal, 1px e token atual em `tests/unit/radix-separator.test.tsx`.

### Implementation for User Story 1

- [ ] T012 [US1] Implementar `src/renderer/components/radix/dialog.tsx` e substituir o interior de `src/renderer/components/Modal.tsx`, preservando a API atual.
- [ ] T013 [US1] Implementar `src/renderer/components/radix/select.tsx` e migrar `src/renderer/features/projects/project-selector.tsx`, `team-selector.tsx`, `src/renderer/features/work-items/work-items-filter-bar.tsx` e `src/renderer/features/pull-requests/pull-requests-filter-bar.tsx`.
- [ ] T014 [US1] Implementar `src/renderer/components/radix/tabs.tsx` e refatorar `src/renderer/features/shell/product-tabs.tsx`, `product-shell.tsx` e `configured-app.tsx` para Root/List/Trigger/Content.
- [ ] T015 [US1] Implementar `src/renderer/components/radix/separator.tsx` e usá-lo em `src/renderer/features/overview/card-shell.tsx`.
- [ ] T016 [US1] Ajustar CSS dos wrappers em `src/renderer/styles/global.css` para paridade visual e portais acima do titlebar.
- [ ] T017 [US1] Atualizar testes existentes que usam selects nativos/abas para os novos roles do Radix em `tests/unit/` e `tests/e2e/`.
- [ ] T018 [US1] Adicionar e2e de Dialog, Select, Tabs e Separator em `tests/e2e/radix-controls.spec.ts`.

**Checkpoint**: US1 funcional e visualmente equivalente.

---

## Phase 4: User Story 2 — Hover Cards nos cards da Overview (Priority: P2)

**Goal**: exibir os textos fixos no hover/foco do ícone `spam-line`.

**Independent Test**: hover e foco nos três ícones e conferir os textos exatos; testar com 0, 1 e 10 itens.

### Tests for User Story 2

- [ ] T019 [P] [US2] Testar trigger, textos fixos e foco do Hover Card em `tests/unit/radix-hover-card.test.tsx`.
- [ ] T020 [P] [US2] Testar hover/foco/ESC e persistência do texto “10” com zero itens em `tests/e2e/overview-hover-card.spec.ts`.

### Implementation for User Story 2

- [ ] T021 [US2] Implementar `src/renderer/components/radix/hover-card.tsx` com trigger focável e portal.
- [ ] T022 [US2] Integrar o Hover Card ao ícone `spam-line` em `src/renderer/features/overview/card-shell.tsx`.
- [ ] T023 [US2] Passar os textos fixos por card em `src/renderer/features/overview/work-items-card.tsx`, `pipeline-card.tsx` e `pull-request-card.tsx`.
- [ ] T024 [US2] Estilizar o conteúdo como o popover `Aviso` em `src/renderer/styles/global.css`, usando tokens existentes.

**Checkpoint**: US1 + US2 funcionam juntas, com texto fixo em “10”.

---

## Phase 5: User Story 3 — Overview com até 10 itens e Scroll Area (Priority: P3)

**Goal**: carregar até 10 itens por categoria, exibir em Scroll Area e adaptar dados/cache.

**Independent Test**: com 10 itens em cada categoria, rolar cada card mantendo cabeçalho e separador fixos.

### Tests for User Story 3

- [ ] T025 [P] [US3] Testar contrato IPC v2, arrays e limite de 10 em `tests/contract/overview-ipc.test.ts`.
- [ ] T026 [P] [US3] Testar prioridade, PRs relacionados e pipelines no cliente em `tests/unit/azure-devops-overview-ten.test.ts`.
- [ ] T027 [P] [US3] Testar cache `schemaVersion: 2` e serviço com arrays em `tests/unit/overview-service.test.ts` e `tests/unit/overview-cache.test.ts`.
- [ ] T028 [P] [US3] Testar renderização de 10 itens/scroll em `tests/unit/overview-scroll-area.test.tsx`.

### Implementation for User Story 3

- [ ] T029 [US3] Atualizar `src/shared/contracts/index.ts`: `OverviewView` com `pullRequests[]`, `pipelines[]`, `workItems[]` até 10 e `WorkItemSummary.priority`.
- [ ] T030 [US3] Atualizar `src/main/services/overview-cache-service.ts` e `src/main/services/overview-service.ts` para schema 2 e arrays.
- [ ] T031 [US3] Atualizar `src/main/services/azure-devops-client.ts`: 10 work items por prioridade, 10 PRs relacionados (revisor/autor) e 10 pipelines por `startedAt`.
- [ ] T032 [US3] Atualizar `src/main/ipc/handlers.ts` e `src/preload/index.ts` para o novo shape do Overview.
- [ ] T033 [US3] Implementar `src/renderer/components/radix/scroll-area.tsx` com viewport, barra oculta e rolagem por teclado.
- [ ] T034 [US3] Atualizar `src/renderer/features/overview/overview-screen.tsx` e os três cards para arrays de até 10 itens com Scroll Area.
- [ ] T035 [US3] Atualizar estados vazios/erro/plural e textos em `src/renderer/i18n/pt-BR.ts`.
- [ ] T036 [US3] Adicionar e2e de 10 itens e rolagem em `tests/e2e/overview-ten-items.spec.ts`.

**Checkpoint**: Overview com até 10 itens, cache v2 e Scroll Area.

---

## Phase 6: User Story 4 — Tooltip preparado sem uso (Priority: P4)

**Goal**: primitive instalada e pronta, sem tooltip visual.

**Independent Test**: revisar a interface e confirmar que nenhum tooltip novo aparece.

### Tests for User Story 4

- [ ] T037 [P] [US4] Testar que nenhum trigger de Tooltip é renderizado nas telas em `tests/e2e/radix-tooltip.spec.ts`.

### Implementation for User Story 4

- [ ] T038 [US4] Criar `src/renderer/components/radix/tooltip.tsx` com `TooltipProvider` e wrapper sem triggers.
- [ ] T039 [US4] Envolver a aplicação no provider em `src/renderer/app.tsx`, sem adicionar tooltips.

**Checkpoint**: Tooltip disponível, sem alteração visual.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T040 [P] Atualizar `docs/design/gaps.md`, `docs/security/review.md` e `specs/007-radix-ui-adoption/quickstart.md` com os resultados.
- [ ] T041 [P] Adicionar auditoria axe dos novos fluxos em `tests/e2e/radix-a11y.spec.ts`.
- [ ] T042 [P] Atualizar snapshots visuais somente se inevitável e justificar em `tests/e2e/`.
- [ ] T043 [P] Adicionar teste de performance com 10 itens/scroll em `tests/e2e/overview-radix-performance.spec.ts`.
- [ ] T044 Rodar `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:coverage`, `npm run build` e `npm run test:e2e` usando os scripts de `package.json`.
- [ ] T045 Fazer o commit da feature 007 e atualizar `specs/007-radix-ui-adoption/tasks.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; bloqueia os wrappers.
- **US1 (Phase 3)**: depende da Foundational; é o MVP e deve ser concluída primeiro.
- **US2 (Phase 4)**: depende da Foundational e de `card-shell.tsx` da US1.
- **US3 (Phase 5)**: depende da Foundational; altera dados e cards, preferencialmente após US1.
- **US4 (Phase 6)**: pode ocorrer em paralelo após Setup.
- **Polish (Phase 7)**: depende de todas as histórias.

### User Story Dependencies

- **US1**: MVP de migração visual; sem dependência de dados.
- **US2**: usa o card-shell migrado na US1.
- **US3**: independente visualmente da US2, mas compartilha os cards; executar após US1 para evitar conflito.
- **US4**: independente; apenas provider e nenhum trigger.

### Parallel Opportunities

- T002, T003, T004 em paralelo.
- T005, T006 em paralelo.
- Testes T008–T011 em paralelo; implementações T012–T015 em arquivos diferentes.
- T019/T020 em paralelo; T025–T028 em paralelo.
- T040–T043 em paralelo.

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
2. US2 — Hover Cards com texto fixo.
3. US3 — 10 itens por categoria + Scroll Area.
4. US4 — Tooltip preparado sem uso.
5. Polish e validação completa.

---

## Notes

- [P] = arquivos diferentes, sem dependência.
- Testes antes da implementação.
- Não alterar layout, cores, tipografia, ícones, titlebar, footer ou janela 900×700.
- O texto do Hover Card é fixo em “10”, independentemente da quantidade.
- Tooltip não deve criar nenhum trigger visual nesta feature.
- Cache de Overview v1 deve ser descartado; v2 é o novo formato.
- PRs relacionados = revisor ou autor.
- Prioridade de work item = `Microsoft.VSTS.Common.Priority`; fallback `ChangedDate`.
