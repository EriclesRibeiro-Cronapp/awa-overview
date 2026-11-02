# Quickstart — Tela Work items

## Pré-requisitos

- Features 001 e 002 configuradas.
- PAT com **Project and Team (Read)** e **Work Items (Read)**; Code/Build são
  necessários apenas para os cards do Overview.
- Projeto e time selecionados (time opcional).

## Executar

```powershell
npm install
npm run dev
```

## Validação manual

1. Abrir o app e selecionar a aba **Work items**.
2. Conferir o título com ícone de jornal e o resumo Total/Backlog/Em andamento/
   Concluído.
3. Conferir os filtros: busca, Tipo, Responsável, Status e Sprint.
4. Buscar por parte de um título e por `#ID`.
5. Aplicar cada filtro isoladamente e combinado; a tabela deve reagir na hora.
6. Conferir as colunas ID, Tipo, Título, Status, Sprint e Acessar; o título deve
   quebrar em até duas linhas.
7. Rolar a tabela: três linhas visíveis, cabeçalho fixo.
8. Acionar Acessar e confirmar a abertura do item no navegador padrão.
9. Acionar **Atualizar** e verificar o horário e os dados.
10. Simular cache vencido/offline e conferir o aviso de dados desatualizados.
11. Testar filtros sem resultado e conferir a mensagem vazia.
12. Testar apenas teclado, foco visível e leitor de tela.

## Detalhes visuais de referência

| Elemento | Medida/comportamento |
|---|---|
| Título | ícone 24px + texto 16px bold |
| Resumo | 860×56, quatro blocos, separadores 1px |
| Filtros | 860×28, busca flexível + quatro selects |
| Tabela | 860×188, 6 colunas, gap 8px, linhas 47px |
| Visível | cabeçalho + 3 linhas, rolagem vertical |
| Status | Em andamento azul, Backlog cinza, Concluído verde |
| Rodapé | Atualizado em + Atualizar + contexto |

## Testes automatizados

```powershell
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

## Observação de design

O export antigo `board-work-items--19-237.png` não mostra título/abas; a análise
manual revisada em 01/11 define título, resumo, filtros e tabela. Esta feature segue
a análise manual e registra a divergência em `docs/design/gaps.md` (G-25).

## Critérios de aceite

- [ ] Aba Work items navegável e Overview preservado.
- [ ] Título, resumo, filtros e tabela fiéis às medidas documentadas.
- [ ] Busca/filtros em tempo real e estado vazio.
- [ ] Três linhas visíveis com rolagem e cabeçalho fixo.
- [ ] Links abrem somente no Azure DevOps.
- [ ] Cache de 5 min, atualização manual e staleness.
- [ ] Nenhum PAT exposto e nenhuma escrita.
- [ ] WCAG 2.2 AA e navegação por teclado.
- [ ] Features 001 e 002 sem regressões.

## Status de validação (2026-11-02)

| Verificação | Resultado |
|---|---|
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm test` | 115 testes |
| `npm run build` | OK |
| `npm run test:e2e` | 16 passaram · 1 skip |
| Axe na tela Work items | sem violações |
| Snapshot visual | `work-items-filled.png` |
| Filtros com 2.000 itens | < 200 ms |

