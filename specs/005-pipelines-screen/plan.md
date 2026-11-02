# Implementation Plan: Tela Pipelines

**Branch**: `005-pipelines-screen` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-pipelines-screen/spec.md`

## Summary

Habilitar a aba **Pipelines** com título, busca e tabela de execuções recentes do
projeto. Cada linha exibe status (ícone + rótulo acessível), nome, descrição da
definição, data de execução, duração e acesso ao Azure DevOps. Dados somente leitura,
cache cifrado de 5 minutos, atualização manual e staleness.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 24 (Electron 45); React 19

**Primary Dependencies**: Electron 45, electron-vite, React, TanStack Query, Zod,
electron-log, Vitest, React Testing Library, Playwright, axe-core

**Storage**: `pipelines-cache.json.enc`, AES-256-GCM, chave do `safeStorage`,
TTL 300s, separado dos demais caches.

**Testing**: Vitest + RTL; contrato IPC; Playwright/Electron; fixtures de builds e
definições; axe-core; snapshot visual.

**Target Platform**: Windows 10/11 x64; 900×700 mínimo.

**Project Type**: desktop-app (Electron main + preload + renderer).

**Performance Goals**: cache <2s; API <8s p95; busca <200ms para 500 execuções.

**Constraints**: read-only; PAT fora da UI/logs/URLs; PT-BR; WCAG 2.2 AA; tabela de
3 linhas visíveis; sem paginação desenhada.

**Scale/Scope**: 1 organização, 100 projetos, 1 projeto/time, até 500 execuções.

## Constitution Check

| Princípio | Gate | Status | Evidência |
|---|---|---|---|
| I. Modularidade | Serviço/feature isolados | PASS | `pipelines-service` + `features/pipelines` |
| II. Camadas | UI → IPC → aplicação → integração | PASS | Handler `pipelines:load` |
| III. Código | Lint/typecheck/cobertura | PASS | ESLint + `tsc` + Vitest |
| IV. Componentização | Tabela, busca e rodapé reutilizados | PASS | Shell/ProductFooter |
| V. Fidelidade + a11y | Medidas e WCAG AA | PASS | Layout documentado; cores corrigidas |
| VI. Credenciais | PAT só no main | PASS | IPC sem PAT |
| VII. Erros | Erros acionáveis | PASS | `AppError` + retry |
| VIII. Testes | Unidade/contrato/integração/e2e | PASS | Fixtures de build/definition |
| IX. ADRs | Decisões existentes | PASS | ADR-0005/0011 |
| X. Observabilidade | Logs redigidos | PASS | Eventos sem segredo |

Nenhuma violação; sem nova dependência de runtime.

## Project Structure

```text
specs/005-pipelines-screen/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/{ipc.md,azure-devops.md}
└── checklists/requirements.md

src/
├── main/
│   ├── ipc/handlers.ts                 # pipelines:load
│   └── services/
│       ├── azure-devops-client.ts      # listPipelines + definitions
│       ├── pipelines-service.ts
│       └── pipelines-cache-service.ts
├── preload/index.ts
├── renderer/
│   ├── app.tsx
│   ├── features/
│   │   ├── shell/                      # abas/rodapé/contexto
│   │   └── pipelines/
│   │       ├── pipelines-page.tsx
│   │       ├── pipelines-filters.tsx
│   │       ├── pipelines-table.tsx
│   │       └── use-pipelines.ts
│   └── styles/global.css
└── shared/
    ├── contracts/index.ts
    └── pipelines.ts
tests/{unit,integration,contract,e2e}/
```

## Phase 0: Research

Saída em [research.md](./research.md): builds + definitions, status/cores, duração,
busca, cache, tabela e escopo.

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

Nenhuma violação. Limite de 500 execuções e tabela de 3 linhas são decisões de escopo.
