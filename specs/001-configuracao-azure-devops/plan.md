# Implementation Plan: Configuração e conexão com Azure DevOps

**Branch**: `001-configuracao-azure-devops` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-configuracao-azure-devops/spec.md`

## Summary

Entregar a configuração inicial do AWA Overview: modal com organização e PAT
read-only, validação via Azure DevOps, persistência do PAT em cofre do sistema
operacional, listagem de projetos e times por projeto, remoção da configuração e
tratamento consistente de erros. A aplicação é desktop, read-only, de instância
única, sem autenticação própria e com uma organização ativa.

A stack adotada é **Electron 45 + TypeScript + React 19**, com processo principal
responsável por credenciais, API e cache, preload expondo uma API IPC mínima e
renderer sem acesso a Node. O PAT nunca retorna ao renderer após ser salvo.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 24 (embutido no Electron 45); React 19

**Primary Dependencies**: Electron 45, electron-vite, React, TanStack Query, Zod,
electron-log, electron-builder, electron-updater, Vitest, React
Testing Library, Playwright, MSW, axe-core

**Storage**: configuração não sensível em arquivo JSON atômico; PAT cifrado com
`safeStorage` (DPAPI/Keychain/libsecret) e persistido como blob; cache de projetos
e times em JSON cifrado com AES-256-GCM, chave aleatória guardada no `safeStorage`.
SQLite/SQLCipher será reavaliado quando o volume de dados crescer (work items, PRs,
pipelines).

**Testing**: Vitest + React Testing Library (unidade/integração); Playwright para
Electron (e2e); MSW para fixtures do Azure DevOps; axe-core para acessibilidade

**Target Platform**: Windows 10/11 x64 no primeiro release; arquitetura preparada
para macOS/Linux depois

**Project Type**: desktop-app (Electron: main + preload + renderer)

**Performance Goals**: startup < 3s; validação da configuração < 5s; lista de até
100 projetos < 5s; memória em idle < 300MB

**Constraints**: read-only; sem autenticação própria; uma organização; instância
única; PAT com escopos de leitura; offline com cache; PT-BR; WCAG 2.2 AA; nenhum
segredo em logs, URLs, erros ou diagnóstico

**Scale/Scope**: 1 organização, até 100 projetos, times por projeto; esta feature
cobre apenas configuração, projetos e times

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Gate | Status | Evidência |
|---|---|---|---|
| I. Modularidade | Módulos lógicos com contratos claros; sem abstração preventiva | PASS | Estrutura `main/services`, `shared/contracts`, `renderer/features` |
| II. Camadas | Direção UI → aplicação → domínio; adaptadores implementam portas | PASS | IPC é a porta; renderer sem Node; main concentra API/cache |
| III. Código | Lint, format e typecheck no CI | PASS | ESLint + Prettier + `tsc --noEmit` |
| IV. Componentização | Componentes e tokens documentados | PASS | Tab, Tag, Input, Button, Modal, estados |
| V. Fidelidade + a11y | Comparação com screenshots; WCAG 2.2 AA | PASS | Playwright visual + axe-core |
| VI. Credenciais | PAT em cofre; nunca reexibido; sem logs | PASS | `safeStorage`; IPC retorna apenas máscara |
| VII. Erros | Catálogo de códigos e mensagens acionáveis | PASS | `shared/errors.ts` + `docs/observability` |
| VIII. Testes | Unidade, integração, e2e e fixtures | PASS | Vitest/RTL/Playwright/MSW |
| IX. ADRs | Decisões registradas | PASS | ADRs 0001, 0002, 0004, 0005, 0006, 0009, 0010 |
| X. Observabilidade | Logs estruturados e redigidos | PASS | electron-log + redaction central |

Nenhuma violação identificada. Não há complexidade adicional a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/001-configuracao-azure-devops/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ipc.md
│   └── azure-devops.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── index.ts                 # ciclo de vida, instância única, janela
│   ├── ipc/
│   │   └── handlers.ts          # contratos IPC
│   ├── services/
│   │   ├── config-service.ts    # organização e preferências
│   │   ├── credentials-service.ts
│   │   ├── azure-devops-client.ts
│   │   ├── projects-service.ts
│   │   ├── cache-service.ts
│   │   └── logger.ts
│   └── security/
│       └── redaction.ts
├── preload/
│   └── index.ts                 # contextBridge tipado
├── renderer/
│   ├── main.tsx
│   ├── app.tsx
│   ├── components/              # Tab, Tag, Button, Input, Modal, Icon, EmptyState
│   ├── features/
│   │   ├── config/              # ConfigModal, validação e estados
│   │   └── projects/            # seletores de projeto e time
│   ├── i18n/pt-BR.ts
│   └── styles/tokens.css
└── shared/
    ├── contracts/               # tipos IPC, config e Azure DevOps
    ├── errors.ts
    └── types.ts

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: projeto único Electron com três processos lógicos
(main/preload/renderer) e `shared` para contratos. Não há backend separado. A
separação física em pacotes não é necessária (Princípio I, monólito modular).

## Phase 0: Research

Saída em [research.md](./research.md). Decisões resolvidas: Electron vs Tauri,
armazenamento do PAT, cache, API do Azure DevOps, testes, empacotamento e SO.

## Phase 1: Design

- [data-model.md](./data-model.md) — entidades, estados e validações.
- [contracts/ipc.md](./contracts/ipc.md) — contratos entre renderer e main.
- [contracts/azure-devops.md](./contracts/azure-devops.md) — endpoints e mapeamento.
- [quickstart.md](./quickstart.md) — execução, testes e validação manual.

## Post-Design Constitution Check

| Gate | Status | Observação |
|---|---|---|
| Credenciais fora do renderer | PASS | PAT só no main; IPC devolve `patLast4` |
| Cache cifrado | PASS | AES-256-GCM com chave no `safeStorage` |
| Read-only | PASS | Nenhum método de escrita no client |
| Erros mapeados | PASS | 401/403/404/429/5xx com códigos |
| Acessibilidade | PASS | Foco, rótulos, `aria-live` e axe |
| Testes | PASS | Unit, integração e e2e planejados |

## Complexity Tracking

Nenhuma violação constitucional. As escolhas abaixo são deliberadas e registradas
em ADR:

| Escolha | Por que | Alternativa rejeitada |
|---|---|---|
| Electron em vez de Tauri | Ecossistema, suporte, renderização consistente e time TS | Tauri exigiria camada Rust e WebView variável |
| Cache JSON cifrado em vez de SQLite | Volume pequeno nesta feature; menos complexidade nativa | SQLite/SQLCipher reavaliado quando o volume crescer |
| Atualização automática adiada | Primeiro release foca configuração e confiabilidade | Auto-update entra com assinatura no ADR 0009 |
