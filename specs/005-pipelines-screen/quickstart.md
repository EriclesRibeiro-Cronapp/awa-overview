# Quickstart — Tela Pipelines

## Pré-requisitos

- Features 001–004 configuradas.
- PAT com **Build (Read)** e **Project and Team (Read)**.
- Projeto selecionado.

## Executar

```powershell
npm install
npm run dev
```

## Validação manual

1. Abrir o app e selecionar a aba **Pipelines**.
2. Conferir título, busca e tabela.
3. Conferir colunas Pipeline, Detalhes, Executado em e Acessar.
4. Conferir status por ícone + rótulo acessível: sucesso, falha, parcial,
   cancelado, em andamento, na fila.
5. Conferir data, duração e fallback `—` para execuções sem fim.
6. Conferir descrição da definição e fallback para buildNumber.
7. Buscar por nome e por descrição.
8. Rolar a tabela com cabeçalho fixo.
9. Acionar Acessar e confirmar a abertura no Azure DevOps.
10. Acionar Atualizar e conferir o rodapé.
11. Simular cache vencido/offline e conferir staleness.
12. Testar busca sem resultado, teclado, foco e leitor de tela.

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

- [ ] Aba Pipelines navegável e contexto preservado.
- [ ] Título, busca e tabela conforme design.
- [ ] Status, data, duração e descrição corretos.
- [ ] Links somente Azure DevOps.
- [ ] Cache de 5 min, atualização e staleness.
- [ ] Nenhum PAT exposto e nenhuma escrita.
- [ ] WCAG 2.2 AA e teclado.
- [ ] Features 001–004 sem regressões.

## Status de validação (2026-11-02)

| Verificação | Resultado |
|---|---|
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm test` | 147 testes |
| `npm run build` | OK |
| `npm run test:e2e` | 18 passaram · 1 skip |
| Axe na tela | sem violações |
| Snapshot visual | `pipelines-filled.png` |
| Busca com 500 execuções | < 200 ms |

