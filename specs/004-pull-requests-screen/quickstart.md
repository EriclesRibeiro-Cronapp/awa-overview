# Quickstart — Tela Pull requests

## Pré-requisitos

- Features 001–003 configuradas.
- PAT com **Code (Read)** e **Project and Team (Read)**.
- Projeto selecionado.

## Executar

```powershell
npm install
npm run dev
```

## Validação manual

1. Abrir o app e selecionar a aba **Pull requests**.
2. Conferir título, busca e filtro de Status.
3. Conferir colunas `!ID`, Título, Status e Acessar; três linhas visíveis.
4. Buscar por `!ID`, `ID` e parte do título.
5. Filtrar Aberto, Concluído e Abandonado; combinar com busca.
6. Conferir status por texto/cor e contraste.
7. Rolar a tabela com cabeçalho fixo.
8. Acionar Acessar e confirmar a abertura no Azure DevOps.
9. Acionar Atualizar e conferir o rodapé.
10. Simular cache vencido/offline e conferir staleness.
11. Testar filtros sem resultado.
12. Testar apenas teclado, foco e leitor de tela.

## Testes automatizados

```powershell
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

## Critérios de aceite

- [ ] Aba Pull requests navegável e contexto preservado.
- [ ] Título, busca, filtro e tabela conforme design.
- [ ] 41px de cabeçalho, 49px por linha, 3 linhas visíveis.
- [ ] Status Aberto/Concluído/Abandonado acessíveis.
- [ ] Links somente Azure DevOps.
- [ ] Cache de 5 min, atualização e staleness.
- [ ] Nenhum PAT exposto e nenhuma escrita.
- [ ] WCAG 2.2 AA e teclado.
- [ ] Features 001–003 sem regressões.

## Status de validação (2026-11-02)

| Verificação | Resultado |
|---|---|
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm test` | 131 testes |
| `npm run build` | OK |
| `npm run test:e2e` | 17 passaram · 1 skip |
| Axe na tela | sem violações |
| Snapshot visual | `pull-requests-filled.png` |
| Filtros com 1.000 PRs | < 200 ms |

