# Tasks: Configuração e conexão com Azure DevOps

**Input**: Design documents from `specs/001-configuracao-azure-devops/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Incluídos porque a spec e a constituição exigem testes de regras de
negócio, fluxos críticos, acessibilidade e isolamento da API real.

**Atualização**: tarefas ajustadas após `/speckit.analyze` (02/11): CFG-009,
ajuda do PAT, exportação de diagnóstico, onboarding, canais restantes e
verificações de SC.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1, US2 ou US3
- Todo task tem caminho de arquivo exato

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização do projeto Electron + TypeScript + React e tooling.

- [X] T001 Criar a estrutura `src/main`, `src/preload`, `src/renderer`, `src/shared` e `tests/` conforme o plano em `src/`
- [X] T002 Inicializar `package.json` com Electron 45, React 19, TypeScript, electron-vite, electron-builder, electron-log, TanStack Query, Zod, Vitest, RTL, Playwright, MSW e axe-core em `package.json`
- [X] T003 [P] Configurar TypeScript strict e aliases em `tsconfig.json`
- [X] T004 [P] Configurar ESLint e Prettier em `eslint.config.js` e `.prettierrc`
- [X] T005 [P] Configurar Vitest, RTL e thresholds de cobertura (80% em `src/main/services` e `src/shared`) em `vitest.config.ts` e `tests/setup.ts`
- [X] T006 [P] Configurar Playwright para Electron em `playwright.config.ts`
- [X] T007 [P] Configurar electron-builder NSIS em `electron-builder.yml`
- [X] T008 [P] Configurar CI do GitHub Actions com gate de cobertura em `.github/workflows/ci.yml`
- [X] T009 [P] Configurar CSP e defaults de segurança em `src/main/security/csp.ts`
- [X] T010 Criar bootstrap do app com instância única em `src/main/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contratos, serviços e UI base que todas as histórias usam.

**CRITICAL**: nenhuma user story começa antes desta fase.

- [X] T011 Definir tipos e contratos compartilhados (`ConfigView`, `Project`, `Team`, `AppError`) em `src/shared/contracts/index.ts`
- [X] T012 Definir catálogo de códigos e mensagens de erro, incluindo `CFG-009`, em `src/shared/errors.ts`
- [X] T013 [P] Implementar logger estruturado com redaction em `src/main/services/logger.ts` e `src/main/security/redaction.ts`
- [X] T014 [P] Implementar store de configuração (organização e preferências) em `src/main/services/config-service.ts`
- [X] T015 Implementar serviço de credenciais com `safeStorage` e falha fechada em `src/main/services/credentials-service.ts`
- [X] T016 Implementar cache cifrado AES-256-GCM com chave no cofre em `src/main/services/cache-service.ts`
- [X] T017 Implementar client HTTP base do Azure DevOps (auth, timeout, retry, paginação) em `src/main/services/azure-devops-client.ts`
- [X] T018 Implementar registro de canais IPC e handlers base em `src/main/ipc/handlers.ts`
- [X] T019 Implementar ponte `contextBridge` tipada em `src/preload/index.ts`
- [X] T020 [P] Criar componentes base (Button, Input, Modal, Tag, Icon, EmptyState) em `src/renderer/components/`
- [X] T021 [P] Importar tokens e estilos do design em `src/renderer/styles/tokens.css`
- [X] T022 [P] Criar dicionário PT-BR em `src/renderer/i18n/pt-BR.ts`
- [X] T023 Escrever testes de contrato de IPC e Azure DevOps em `tests/contract/`
- [X] T024 Escrever testes unitários de credenciais e cache em `tests/unit/`
- [X] T025 Implementar serviço e canal `diagnostics:export` sem segredos em `src/main/services/diagnostics-service.ts` e `src/main/ipc/handlers.ts`
- [X] T026 Implementar canal `app:version` em `src/main/ipc/handlers.ts`
- [X] T027 Configurar rotação e retenção de logs em `src/main/services/logger.ts`

**Checkpoint**: fundação pronta; histórias podem começar.

---

## Phase 3: User Story 1 - Configurar organização e PAT (Priority: P1) — MVP

**Goal**: modal com organização e PAT, validação read-only, gravação segura,
máscara de 4 caracteres e onboarding.

**Independent Test**: instalação limpa → informar org e PAT válidos → salvar →
configuração aceita, PAT mascarado e projetos carregados.

### Tests for User Story 1

- [X] T028 [P] [US1] Testar cifra/decifra e falha fechada do PAT em `tests/unit/credentials-service.test.ts`
- [X] T029 [P] [US1] Testar `config:get` e `config:save` em `tests/contract/config-ipc.test.ts`
- [X] T030 [P] [US1] Testar 401/403/404/429/rede na validação em `tests/integration/config-validation.test.ts`

### Implementation for User Story 1

- [X] T031 [P] [US1] Implementar normalização e modelo da configuração em `src/main/services/config-service.ts`
- [X] T032 [US1] Implementar validação do PAT com `connectionData` e `projects?$top=1` em `src/main/services/azure-devops-client.ts`
- [X] T033 [US1] Implementar fluxo `config:save` (validar, cifrar, persistir, mascarar) em `src/main/ipc/handlers.ts`
- [X] T034 [US1] Implementar `config:get` retornando apenas `patLast4` em `src/main/ipc/handlers.ts`
- [X] T035 [P] [US1] Implementar a modal de configuração em `src/renderer/features/config/config-modal.tsx`
- [X] T036 [US1] Implementar estados de validação e mensagens de erro em `src/renderer/features/config/use-config-form.ts`
- [X] T037 [US1] Expor os métodos de configuração no preload em `src/preload/index.ts`
- [X] T038 [US1] Adicionar rótulos, foco e `aria-live` na modal em `src/renderer/features/config/config-modal.tsx`
- [X] T039 [US1] Registrar eventos de configuração sem segredos em `src/main/services/config-service.ts`
- [X] T040 [P] [US1] Implementar o estado de primeira execução/onboarding em `src/renderer/features/config/first-run.tsx`
- [X] T041 [P] [US1] Implementar ajuda de criação/revogação e escopos do PAT em `src/renderer/features/config/pat-help.tsx`
- [X] T042 [US1] Testar e2e do caminho feliz, PAT inválido e ajuda em `tests/e2e/config.spec.ts`

**Checkpoint**: US1 funcional e testável isoladamente.

---

## Phase 4: User Story 2 - Carregar projetos e times (Priority: P2)

**Goal**: listar projetos da organização e times por projeto, com cache e estado
offline.

**Independent Test**: configuração válida → seletor de projetos preenchido →
projeto selecionado → somente times daquele projeto.

### Tests for User Story 2

- [X] T043 [P] [US2] Testar contratos `projects:list` e `teams:list` em `tests/contract/projects-ipc.test.ts`
- [X] T044 [P] [US2] Testar paginação, cache e mapeamento de times em `tests/integration/projects-service.test.ts`
- [X] T045 [P] [US2] Testar e2e dos seletores em `tests/e2e/projects.spec.ts`

### Implementation for User Story 2

- [X] T046 [US2] Implementar listagem de projetos com paginação em `src/main/services/projects-service.ts`
- [X] T047 [US2] Implementar listagem de times por projeto em `src/main/services/projects-service.ts`
- [X] T048 [US2] Implementar snapshot de cache, TTL e staleness em `src/main/services/cache-service.ts`
- [X] T049 [US2] Implementar canais `projects:list` e `teams:list` em `src/main/ipc/handlers.ts`
- [X] T050 [P] [US2] Implementar seletor de projetos em `src/renderer/features/projects/project-selector.tsx`
- [X] T051 [P] [US2] Implementar seletor de times e estado vazio em `src/renderer/features/projects/team-selector.tsx`
- [X] T052 [US2] Persistir projeto e time selecionados em `src/main/services/config-service.ts`
- [X] T053 [US2] Implementar canal `session:select` em `src/main/ipc/handlers.ts`
- [X] T054 [US2] Implementar indicador de dados desatualizados em `src/renderer/features/projects/staleness-badge.tsx`

**Checkpoint**: US1 e US2 funcionam independentemente.

---

## Phase 5: User Story 3 - Remover ou trocar configuração (Priority: P3)

**Goal**: remover configuração/trocar organização apagando PAT, chave e cache.

**Independent Test**: configuração salva → remover → PAT fora do cofre, cache
limpo e tela inicial exibida.

### Tests for User Story 3

- [ ] T055 [P] [US3] Testar remoção de cofre, chave e cache em `tests/unit/config-removal.test.ts`
- [ ] T056 [P] [US3] Testar e2e de remoção e troca de organização em `tests/e2e/config-removal.spec.ts`

### Implementation for User Story 3

- [ ] T057 [US3] Implementar `config:remove` limpando cofre, chave e cache em `src/main/ipc/handlers.ts`
- [ ] T058 [US3] Implementar troca de organização com limpeza do cache anterior em `src/main/services/config-service.ts`
- [ ] T059 [US3] Implementar confirmação de remoção em `src/renderer/features/config/remove-config-dialog.tsx`
- [ ] T060 [US3] Registrar remoção/troca sem segredos em `src/main/services/config-service.ts`
- [ ] T061 [US3] Verificar ausência de PAT/cache residual em `tests/integration/removal.test.ts`

**Checkpoint**: as três histórias funcionam de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T062 [P] Rodar auditoria de acessibilidade com axe em `tests/e2e/a11y.spec.ts`
- [ ] T063 [P] Comparar telas com screenshots em `tests/e2e/visual.spec.ts`
- [ ] T064 [P] Validar performance (startup, 100 projetos e startup offline) em `tests/e2e/performance.spec.ts`
- [ ] T065 [P] Testar redaction da exportação de diagnóstico em `tests/unit/diagnostics.test.ts`
- [ ] T066 [P] Executar o fluxo do quickstart e registrar em `specs/001-configuracao-azure-devops/quickstart.md`
- [ ] T067 [P] Revisar CSP, ausência de autenticação, read-only, instância única e ausência de Node no renderer em `src/main/security/csp.ts`
- [ ] T068 [P] Medir o tempo de configuração (< 2 min) em `tests/e2e/config-time.spec.ts`
- [ ] T069 [P] Auditar ausência de requisições de escrita no Azure DevOps em `tests/integration/read-only.test.ts`
- [ ] T070 [P] Testar segunda instância e foco da janela em `tests/e2e/single-instance.spec.ts`
- [ ] T071 Rodar lint, typecheck, testes e build via scripts em `package.json`
- [ ] T072 Atualizar `docs/design/gaps.md` e ADRs afetadas após a implementação em `docs/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup e bloqueia todas as histórias.
- **User Stories (Phase 3+)**: dependem da Foundation; podem rodar em paralelo.
- **Polish (Phase 6)**: depende das histórias concluídas.

### User Story Dependencies

- **US1 (P1)**: independente; base do MVP.
- **US2 (P2)**: depende de US1 para existir configuração válida.
- **US3 (P3)**: depende de US1 para existir configuração a remover.

### Within Each User Story

- Testes antes da implementação (falham primeiro).
- Contratos/modelos antes de serviços.
- Serviços antes de IPC/UI.
- UI antes do e2e.
- História concluída antes da próxima prioridade.

### Parallel Opportunities

- Setup: T003–T009.
- Foundation: T013, T014, T020, T021, T022.
- US1: T028–T030; T031/T035; T040/T041.
- US2: T043–T045; T050/T051.
- US3: T055/T056.
- Polish: T062–T070.

---

## Parallel Example: User Story 1

```bash
# Testes em paralelo
Task: "T028 [US1] Credenciais em tests/unit/credentials-service.test.ts"
Task: "T029 [US1] Contrato IPC em tests/contract/config-ipc.test.ts"
Task: "T030 [US1] Validação em tests/integration/config-validation.test.ts"

# Implementação paralela em arquivos distintos
Task: "T031 [US1] Config service em src/main/services/config-service.ts"
Task: "T035 [US1] Modal em src/renderer/features/config/config-modal.tsx"
Task: "T040 [US1] Onboarding em src/renderer/features/config/first-run.tsx"
Task: "T041 [US1] Ajuda do PAT em src/renderer/features/config/pat-help.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 — Setup.
2. Phase 2 — Foundation (bloqueia tudo).
3. Phase 3 — US1 (T028–T042).
4. Parar e validar US1 isoladamente.
5. Demonstrar configuração funcionando.

### Incremental Delivery

1. Setup + Foundation.
2. US1 → validar → demo.
3. US2 → validar → demo.
4. US3 → validar → demo.
5. Polish e release.

---

## Notes

- [P] = arquivos diferentes e sem dependência pendente.
- [US1]/[US2]/[US3] mantêm a rastreabilidade com a spec.
- Nenhum task pode criar operação de escrita no Azure DevOps.
- Nenhum task pode expor o PAT ao renderer, logs ou diagnóstico.
- Commitar após cada task ou grupo lógico.
