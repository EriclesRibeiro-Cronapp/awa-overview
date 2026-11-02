# Implementation Plan: Tela Pull requests

**Branch**: `004-pull-requests-screen` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-pull-requests-screen/spec.md`

## Summary

Habilitar a aba **Pull requests** com título, busca, filtro de Status e tabela de
PRs do projeto selecionado. A tela reutiliza o shell, o padrão de cache cifrado,
staleness, navegação e links externos das features anteriores. Status são exibidos
como texto ("Aberto", "Concluído", "Abandonado") com contraste AA.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 24 (Electron 45); React 19

**Primary Dependencies**: Electron 45, electron-vite, React, TanStack Query, Zod,
electron-log, Vitest, React Testing Library, Playwright, axe-core

**Storage**: `pull-requests-cache.json.enc`, AES-256-GCM, chave do `safeStorage`,
TTL 300s, separado dos demais caches.

**Testing**: Vitest + RTL; contrato IPC; Playwright/Electron; fixtures de PR;
axe-core; snapshot visual.

**Target Platform**: Windows 10/11 x64; 900×700 mínimo.

**Project Type**: desktop-app (Electron main + preload + renderer).

**Performance Goals**: cache <2s; API <8s p95; filtros <200ms para 1.000 PRs.

**Constraints**: read-only; PAT fora da UI/logs/URLs; PT-BR; WCAG 2.2 AA; sem
paginação desenhada; tabela 41px + 3×49px.

**Scale/Scope**: 1 organização, 100 projetos, 1 projeto/time, até 1.000 PRs.

## Constitution Check

| Princípio | Gate | Status | Evidência |
|---|---|---|---|
| I. Modularidade | Serviço/feature isolados | PASS | `pull-requests-service` + `features/pull-requests` |
| II. Camadas | UI → IPC → aplicação → integração | PASS | Handler `pullRequests:load` |
| III. Código | Lint/typecheck/cobertura | PASS | ESLint + `tsc` + Vitest |
| IV. Componentização | Tabela, filtros e rodapé reutilizados | PASS | Shell e ProductFooter |
| V. Fidelidade + a11y | Medidas e WCAG AA | PASS | Layout documentado; cores corrigidas |
| VI. Credenciais | PAT só no main | PASS | IPC sem PAT |
| VII. Erros | Erros acionáveis | PASS | `AppError` + retry |
| VIII. Testes | Unidade/contrato/integração/e2e | PASS | Fixtures de PR |
| IX. ADRs | Decisões existentes | PASS | ADR-0005/0011 |
| X. Observabilidade | Logs redigidos | PASS | Eventos sem segredo |

Nenhuma violação; sem nova dependência de runtime.

## Project Structure

```text
specs/004-pull-requests-screen/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ipc.md
│   └── azure-devops.md
└── checklists/requirements.md

src/
├── main/
│   ├── ipc/handlers.ts                 # pullRequests:load
│   └── services/
│       ├── azure-devops-client.ts      # listPullRequests
│       ├── pull-requests-service.ts
│       └── pull-requests-cache-service.ts
├── preload/index.ts
├── renderer/
│   ├── app.tsx                         # ConfiguredApp
│   ├── features/
│   │   ├── shell/                      # abas/rodapé/contexto
│   │   └── pull-requests/
│   │       ├── pull-requests-page.tsx
│   │       ├── pull-requests-filters.tsx
│   │       ├── pull-requests-table.tsx
│   │       └── use-pull-requests.ts
│   └── styles/global.css
└── shared/
    ├── contracts/index.ts
    └── pull-requests.ts                # labels
tests/
├── unit/
├── integration/
├── contract/
└── e2e/
```

## Phase 0: Research

Saída em [research.md](./research.md): endpoint, status, cache, filtros, tabela,
cores acessíveis e navegação.

## Phase 1: Design

- [data-model.md](./data-model.md)
- [contracts/ipc.md](./contracts/ipc.md)
- [contracts/azure-devops.md](./contracts/azure-devops.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

| Gate | Status |
|---|---|
| Read-only | PASS |
| PAT fora do renderer | PASS |
| Cache cifrado | PASS |
| Erros/staleness | PASS |
| Acessibilidade | PASS |
| Testes | PASS |

## Complexity Tracking

Nenhuma violação. Limite de 1.000 PRs e tabela de 3 linhas são decisões de escopo.
