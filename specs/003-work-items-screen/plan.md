# Implementation Plan: Tela Work items

**Branch**: `003-work-items-screen` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-work-items-screen/spec.md`

## Summary

Habilitar a aba **Work items** e entregar a tela com título, resumo de quatro
contagens, busca, filtros de Tipo/Responsável/Status/Sprint e tabela com ID, Tipo,
Título, Status, Sprint e Acessar. Os dados vêm do projeto/time selecionado, são
somente leitura, ficam em cache cifrado por 5 minutos e podem ser atualizados
manualmente. A navegação Overview ↔ Work items preserva o contexto.

A implementação reutiliza o shell, o cliente Azure DevOps, WIQL read-only,
`EncryptedJsonStore`, o padrão de cache/staleness e os tokens/ícones da feature 002.

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 24 (Electron 45); React 19

**Primary Dependencies**: Electron 45, electron-vite, React, TanStack Query, Zod,
electron-log, Vitest, React Testing Library, Playwright, axe-core

**Storage**: novo snapshot `work-items-cache.json.enc` com AES-256-GCM, mesma chave
do `safeStorage`; TTL de 300s; cache separado do Overview e de projetos/times.

**Testing**: Vitest + RTL; contrato IPC; Playwright/Electron; fixtures de WIQL e
work items; axe-core; snapshot visual.

**Target Platform**: Windows 10/11 x64; janela mínima 900×700.

**Project Type**: desktop-app (Electron main + preload + renderer).

**Performance Goals**: cache em <2s; consulta em <8s p95; filtros em <200ms para até
2.000 itens; três linhas visíveis com rolagem.

**Constraints**: read-only; PAT fora da UI/logs/URLs; uma organização; instância
única; PT-BR; WCAG 2.2 AA; fidelidade ao design; sem paginação desenhada.

**Scale/Scope**: 1 organização, 100 projetos, 1 projeto/time, até 2.000 work items
carregados; resumo independente dos filtros.

## Constitution Check

| Princípio | Gate | Status | Evidência |
|---|---|---|---|
| I. Modularidade | Serviço e feature isolados | PASS | `work-items-service` + `features/work-items` |
| II. Camadas | UI → IPC → aplicação → integração | PASS | Handler `workItems:load`; renderer sem API direta |
| III. Código | Lint, typecheck, cobertura | PASS | ESLint + `tsc` + Vitest |
| IV. Componentização | Tabela, filtros, resumo e shell reutilizáveis | PASS | Componentes derivados do design |
| V. Fidelidade + a11y | Medidas do design e WCAG AA | PASS | Layout documentado; correções de contraste |
| VI. Credenciais | PAT só no main | PASS | IPC não recebe PAT |
| VII. Erros | Erros acionáveis e por tela | PASS | Reutiliza `AppError` |
| VIII. Testes | Unidade, contrato, integração e e2e | PASS | Fixtures de WIQL/tabela |
| IX. ADRs | WIQL read-only já registrado | PASS | ADR-0011 |
| X. Observabilidade | Logs redigidos | PASS | Eventos de cache/erro sem segredo |

Nenhuma violação. Não há nova dependência de runtime.

## Project Structure

### Documentation (this feature)

```text
specs/003-work-items-screen/
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
│   ├── ipc/handlers.ts                 # workItems:load
│   └── services/
│       ├── azure-devops-client.ts      # WIQL + lote de work items
│       ├── work-items-service.ts       # resumo, cache e staleness
│       └── work-items-cache-service.ts # snapshot cifrado
├── preload/index.ts                    # window.api.workItems.load
├── renderer/
│   ├── app.tsx                         # navegação Overview/Work items
│   ├── features/
│   │   ├── shell/                      # contexto elevado + abas/rodapé
│   │   └── work-items/
│   │       ├── work-items-page.tsx
│   │       ├── work-items-summary.tsx
│   │       ├── work-items-filters.tsx
│   │       ├── work-items-table.tsx
│   │       └── use-work-items.ts
│   └── styles/global.css
└── shared/contracts/index.ts           # tipos e IPC
tests/
├── unit/
├── integration/
├── contract/
└── e2e/
```

**Structure Decision**: mantém o monólito modular Electron. A tela Work items é uma
feature do renderer; consulta, resumo e cache ficam no main.

## Phase 0: Research

Saída em [research.md](./research.md). Decisões: WIQL sem filtro de responsável,
lote de 200, limite 2.000, classificação de status, filtros client-side, cache e
navegação com contexto elevado.

## Phase 1: Design

- [data-model.md](./data-model.md) — tipos, resumo, filtros e snapshot.
- [contracts/ipc.md](./contracts/ipc.md) — `workItems:load`.
- [contracts/azure-devops.md](./contracts/azure-devops.md) — WIQL, campos e lote.
- [quickstart.md](./quickstart.md) — validação manual e automatizada.

## Post-Design Constitution Check

| Gate | Status | Observação |
|---|---|---|
| Read-only | PASS | WIQL de consulta; sem mutação |
| PAT fora do renderer | PASS | Handler resolve credencial |
| Cache cifrado | PASS | `EncryptedJsonStore` reutilizado |
| Erros e staleness | PASS | Fallback de cache e retry |
| Acessibilidade | PASS | Tabela semântica, filtros rotulados, contraste |
| Testes | PASS | Unidade, contrato, integração e e2e |

## Complexity Tracking

Nenhuma violação. O limite de 2.000 itens e o resumo independente de filtros são
decisões de escopo documentadas na spec.
