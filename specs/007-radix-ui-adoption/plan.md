# Implementation Plan: Adoção do Radix UI e Overview com 10 itens

**Branch**: `007-radix-ui-adoption` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-radix-ui-adoption/spec.md`

## Summary

Migrar os controles interativos do AWA Overview para primitives Radix UI —
Dialog, Scroll Area, Select, Separator e Tabs — sem alterar o visual atual. A Overview
passa a carregar até 10 itens de cada categoria, com Scroll Area nos cards. Hover Card
e Tooltip serão apenas instalados, sem integração visual nesta feature; o Hover Card
dos ícones `spam-line` será uma feature futura.

Não serão usados Tailwind, shadcn ou uma biblioteca visual completa. Os componentes
Radix em uso serão encapsulados com as classes, tokens e padrões atuais.

## Technical Context

**Language/Version**: TypeScript 5.x; React 19; Electron 45; Node.js 24

**Primary Dependencies**: Radix UI (`@radix-ui/react-dialog`,
`@radix-ui/react-hover-card`, `@radix-ui/react-scroll-area`,
`@radix-ui/react-select`, `@radix-ui/react-separator`,
`@radix-ui/react-tabs`, `@radix-ui/react-tooltip`); dependências atuais mantidas.
Sem Tailwind, shadcn, Lucide ou outra biblioteca visual.

**Storage**: cache de Overview existente, com `schemaVersion` elevado para 2 para
acomodar arrays de até 10 itens; snapshots antigos são ignorados e recriados.

**Testing**: Vitest + React Testing Library; testes de contrato IPC; Playwright
Electron; axe-core; snapshots visuais existentes; testes de dados para prioridade,
PRs relacionados e pipelines.

**Target Platform**: Windows 10/11 x64; janela fixa 900×700 sem frame nativo.

**Project Type**: desktop-app (Electron main + preload + renderer).

**Performance Goals**: manter a Overview responsiva; Scroll Area com 10 itens sem
layout shift; abertura de Select/Dialog sem bloquear a UI.

**Constraints**: zero mudança visual; WCAG 2.2 AA; sem Tailwind/shadcn; sem troca de
ícones; janela/titlebar/footer atuais preservados; read-only; PAT fora da UI.

**Scale/Scope**: até 10 work items, 10 PRs e 10 pipelines por Overview; 4 abas;
modais de configuração/remoção; 6 selects; Hover Card e Tooltip apenas instalados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Gate | Status | Evidência |
|---|---|---|---|
| I. Modularidade | Wrappers Radix isolados e reutilizáveis; sem abstração preventiva | PASS | `components/radix` com API própria; adoção incremental |
| II. Camadas | UI continua consumindo serviços via IPC | PASS | Radix restrito ao renderer; dados no main |
| III. Código | Lint, typecheck e cobertura | PASS | ESLint + `tsc` + Vitest |
| IV. Componentização | Componentes documentados e tokens existentes | PASS | Wrappers preservam classes/tokens; sem novo visual |
| V. Fidelidade + a11y | Snapshots iguais e WCAG 2.2 AA | PASS | Radix melhora foco/teclado; snapshots de regressão |
| VI. Credenciais | PAT não entra em componentes/UI | PASS | Nenhuma mudança no fluxo de credenciais |
| VII. Erros | Erros e staleness preservados | PASS | Dados e estados existentes mantidos |
| VIII. Testes | Unit/RTL/contrato/e2e/axe | PASS | Cobertura planejada para wrappers e fluxos |
| IX. ADRs | Decisão de Radix incremental registrada | PASS | ADR-0012 a criar na implementação |
| X. Observabilidade | Logs atuais mantidos | PASS | Nenhuma alteração de logging |

Nenhuma violação. A inclusão de dependências Radix é justificada por acessibilidade e
comportamento, não por estética.

## Project Structure

### Documentation (this feature)

```text
specs/007-radix-ui-adoption/
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
│   └── services/
│       ├── azure-devops-client.ts      # 10 itens, prioridade, PRs relacionados, pipelines
│       ├── overview-service.ts         # arrays de até 10 e cache v2
│       └── overview-cache-service.ts   # schemaVersion 2
├── renderer/
│   ├── components/
│   │   └── radix/                      # wrappers Dialog, ScrollArea,
│   │                                   # Select, Separator, Tabs
│   ├── features/
│   │   ├── overview/                   # cards, 10 itens, Scroll Area
│   │   ├── shell/                      # Tabs Radix e layout atual
│   │   └── projects/                   # selects Radix
│   └── styles/global.css               # classes visuais preservadas
└── shared/
    └── contracts/index.ts              # OverviewView com arrays
tests/
├── unit/
├── integration/
├── contract/
└── e2e/
```

**Structure Decision**: wrappers Radix no renderer, mantendo a API pública dos
componentes atuais. Nenhuma dependência Radix no main. O cache e o cliente continuam
no main, atrás do IPC.

## Phase 0: Research

Saída em [research.md](./research.md). Decisões: pacotes Radix individuais, dados de
até 10 itens (10 mais recentes, ordenados por prioridade), PRs relacionados, cache v2,
Scroll Area, Select com sentinela, Tabs com conteúdo e Hover Card/Tooltip apenas
instalados.

## Phase 1: Design

- [data-model.md](./data-model.md) — `OverviewView` v2, arrays, cache e copy.
- [contracts/ipc.md](./contracts/ipc.md) — canal `overview:load` atualizado.
- [contracts/azure-devops.md](./contracts/azure-devops.md) — consultas de 10 itens.
- [quickstart.md](./quickstart.md) — validação visual, a11y e comportamento.

## Post-Design Constitution Check

| Gate | Status | Observação |
|---|---|---|
| Visual preservado | PASS | Wrappers usam as mesmas classes/tokens; snapshots como gate |
| Acessibilidade | PASS | Radix Dialog/Select/Tabs/ScrollArea; axe |
| Read-only | PASS | Nenhuma alteração de escrita |
| PAT | PASS | Nenhum dado sensível nos componentes |
| Cache | PASS | Schema v2 com arrays; invalidação preservada |
| Testes | PASS | Unit/RTL/contrato/e2e/axe |

## Complexity Tracking

Nenhuma violação constitucional. A migração incremental evita reescrever todas as
telas de uma vez. O schema v2 do cache é necessário porque PRs e pipelines passam de
um item para arrays.

## Dependencies

- Radix UI é a única nova família de dependências.
- Tooltip fica instalado, mas sem triggers nesta feature.
- Nenhuma dependência de Tailwind, shadcn, Lucide ou biblioteca de datas.
