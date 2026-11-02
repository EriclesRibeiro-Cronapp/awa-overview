# ADR-0006: Testes, cobertura e CI

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0001, ADR-0002
- **Substitui:** —

## Contexto

A constituição exige testes de regras de negócio, fluxos críticos, acessibilidade e
determinismo, sem depender da API real.

## Decisão

- **Unidade/integração:** Vitest + React Testing Library.
- **HTTP:** MSW com fixtures gravadas do Azure DevOps; nenhum teste usa a API real.
- **E2E:** Playwright com `_electron.launch`.
- **Acessibilidade:** `@axe-core/playwright`.
- **Cobertura mínima:** 80% em `src/main/services` e `src/shared`; fluxos críticos
  com teste de integração dedicado.
- **CI:** GitHub Actions em `windows-latest`; lint, typecheck, unit, e2e e build.
- **Gate:** nenhum merge com CI vermelho; exceção de bootstrap registrada no PR.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Jest | Ecossistema | Mais lento com Vite/ESM | Vitest integra melhor |
| Cypress | DX | Suporte a Electron limitado | Playwright cobre Electron |
| Testes manuais | Rápidos no início | Não sustentam regressão | Viola a constituição |

## Consequências

### Positivas

- Testes rápidos e determinísticos.
- Contratos do Azure DevOps verificáveis sem rede.

### Negativas e riscos

- MSW e fixtures exigem manutenção quando a API mudar.
- E2E em Electron é mais lento; rodar em pipeline separado.

## Conformidade constitucional

Atende ao Princípio VIII integralmente e ao Princípio IX (decisão registrada).

## Links

- Pesquisa: `specs/001-configuracao-azure-devops/research.md`
- Quickstart: `specs/001-configuracao-azure-devops/quickstart.md`
