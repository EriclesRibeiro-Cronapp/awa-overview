# Implementation Plan: Tela Overview — visão consolidada de trabalho

**Branch**: `002-overview-dashboard` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-overview-dashboard/spec.md`

## Summary

Implementar o shell de produto e a tela **Overview** com três cards independentes:
work items atribuídos ao usuário, pull request que precisa de atenção e execução
recente de pipeline. O contexto é o projeto/time selecionado na feature 001. As
consultas são somente leitura, os dados são cacheados por 5 minutos em arquivo
cifrado, e o usuário pode forçar atualização. As demais abas ficam visíveis e
indisponíveis nesta feature.

A stack existente é reutilizada: Electron 45, TypeScript, React 19, TanStack Query,
Zod, Vitest, React Testing Library e Playwright. Não há nova dependência de runtime.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 24 (embutido no Electron 45); React 19

**Primary Dependencies**: Electron 45, electron-vite, React, TanStack Query, Zod,
electron-log, Vitest, React Testing Library, Playwright, axe-core

**Storage**: configuração e PAT conforme feature 001; novo snapshot de Overview em
JSON cifrado com AES-256-GCM, usando a mesma chave protegida pelo `safeStorage`.
Cache separado do cache de projetos, com TTL de 5 minutos.

**Testing**: Vitest + React Testing Library (unidade/componentes); testes de
contrato para IPC; Playwright para Electron; MSW/fetch fake para fixtures do Azure
DevOps; axe-core para acessibilidade.

**Target Platform**: Windows 10/11 x64; desktop-only; janela mínima 900×700.

**Project Type**: desktop-app (Electron: main + preload + renderer).

**Performance Goals**: Overview com cache válido em < 2s; atualização com rede em
< 5s (p95); três cards renderizados sem bloquear a janela; nenhuma consulta
duplicada concorrente.

**Constraints**: read-only; sem autenticação própria; PAT fora do renderer, logs,
URLs e diagnóstico; uma organização; instância única; PT-BR; WCAG 2.2 AA; fidelidade
ao design documentado; offline com cache e indicação de staleness.

**Scale/Scope**: 1 organização, até 100 projetos, 1 projeto/time por vez, até 3 work
items, 1 PR e 1 pipeline por card; sem agregação entre projetos nesta feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Gate | Status | Evidência |
|---|---|---|---|
| I. Modularidade | Serviço de Overview isolado, sem abstração preventiva | PASS | `overview-service` consome client/cache; UI em `features/overview` |
| II. Camadas | Renderer → IPC → aplicação → integração/persistência | PASS | Novos handlers IPC; renderer não chama Azure DevOps |
| III. Código | Lint, typecheck e cobertura no CI | PASS | ESLint + `tsc --noEmit` + Vitest |
| IV. Componentização | Reutilizar Tab, Tag, Icon, EmptyState e tokens | PASS | Shell, cards e estados derivados do design |
| V. Fidelidade + a11y | Layout documentado e WCAG 2.2 AA | PASS | Cards/shell do Figma; correções de contraste registradas em gaps |
| VI. Credenciais | PAT só no main; sem exposição | PASS | IPC do Overview não recebe nem devolve PAT |
| VII. Erros | Códigos e mensagens acionáveis por card | PASS | Reutiliza `AppError`; erros independentes |
| VIII. Testes | Unidade, integração, contrato e e2e | PASS | Fixtures para WIQL, PRs e builds |
| IX. ADRs | Decisão de POST read-only registrada | PASS | ADR-0011 |
| X. Observabilidade | Logs redigidos e eventos de atualização | PASS | `logEvent`/`logError` com contexto não sensível |

Nenhuma violação. O único ponto sensível é o uso de `POST` para WIQL; ele é
explicitamente somente leitura e fica coberto pela ADR-0011.

## Project Structure

### Documentation (this feature)

```text
specs/002-overview-dashboard/
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
│   ├── ipc/
│   │   └── handlers.ts                 # overview:load
│   ├── services/
│   │   ├── azure-devops-client.ts      # WIQL, PRs, builds, team area path
│   │   ├── overview-service.ts         # orquestra cards + cache + fallback
│   │   ├── overview-cache-service.ts   # snapshot cifrado do Overview
│   │   └── cache-service.ts            # cache existente de projetos/times
│   └── security/
│       └── redaction.ts
├── preload/
│   └── index.ts                        # window.api.overview.load
├── renderer/
│   ├── app.tsx                         # shell + contexto de projeto/time
│   ├── components/                     # Tab, Tag, Icon, EmptyState, Button
│   ├── features/
│   │   ├── overview/
│   │   │   ├── overview-screen.tsx
│   │   │   ├── work-items-card.tsx
│   │   │   ├── pull-request-card.tsx
│   │   │   ├── pipeline-card.tsx
│   │   │   └── use-overview.ts
│   │   └── shell/
│   │       ├── product-shell.tsx
│   │       └── product-tabs.tsx
│   ├── i18n/pt-BR.ts
│   └── styles/global.css
└── shared/
    └── contracts/index.ts              # tipos do Overview e IPC
tests/
├── unit/
├── integration/
├── contract/
└── e2e/
```

**Structure Decision**: mantém o monólito modular Electron já existente. O Overview
é um módulo de aplicação no main e uma feature no renderer; o cache e o cliente
Azure DevOps permanecem adaptadores de infraestrutura.

## Phase 0: Research

Saída em [research.md](./research.md). Decisões: endpoints e versões da API,
identidade do usuário, WIQL read-only, escopo de time, cache, estados por card e
semântica das abas.

## Phase 1: Design

- [data-model.md](./data-model.md) — tipos, contexto, snapshot e regras.
- [contracts/ipc.md](./contracts/ipc.md) — `overview:load` e resultados por card.
- [contracts/azure-devops.md](./contracts/azure-devops.md) — endpoints, consultas e
  mapeamento de campos.
- [quickstart.md](./quickstart.md) — validação manual e automatizada.

## Post-Design Constitution Check

| Gate | Status | Observação |
|---|---|---|
| PAT fora do renderer | PASS | O IPC do Overview não recebe PAT; main resolve a credencial |
| Read-only | PASS | GETs e WIQL de consulta; nenhuma mutação |
| Cache cifrado | PASS | Snapshot separado com AES-256-GCM |
| Erros independentes | PASS | Resultado por card, sem derrubar os demais |
| Acessibilidade | PASS | Abas com `role=tablist`, foco, texto + ícone |
| Testes | PASS | Contrato, unidade, integração e e2e planejados |

## Complexity Tracking

Nenhuma violação constitucional. A decisão de usar `POST` para WIQL é registrada
na ADR-0011; a alternativa (exigir consultas salvas) reduziria a utilidade e
forçaria configuração manual no Azure DevOps.
