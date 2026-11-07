# Quickstart — Adoção do Radix UI

## Pré-requisitos

- Features 001–006 configuradas.
- PAT com escopos de leitura para projetos, work items, code e build.
- Projeto/time selecionados.

## Executar

```powershell
npm install
npm run dev
```

## Validação manual

1. Abrir a aplicação e confirmar layout, cores, tipografia, ícones, titlebar, footer
   e janela 900×700 idênticos ao estado anterior.
2. Abrir Configurações e a confirmação de remoção:
   - Tab/Shift+Tab, ESC, foco preso e restauração;
   - overlay e footer iguais.
3. Confirmar que a Overview carrega até 10 itens por categoria:
   - work items: 10 mais recentes atribuídos, ordenados por prioridade;
   - pull requests: relacionados ao usuário (revisor ou autor);
   - pipelines: por data de início.
4. Rolar o corpo de cada card; cabeçalho e separador devem permanecer fixos.
5. Confirmar que a Scroll Area não altera os tamanhos 326×550 e 526×271.
6. Abrir todos os selects (projeto, time, filtros de Work items e Status de Pull
   requests), navegar por teclado e confirmar valores/persistência.
7. Navegar pelas abas por clique e setas; confirmar aba ativa e telas.
8. Confirmar que **nenhum Hover Card ou tooltip novo** aparece.
9. Rodar axe e conferir foco, contraste e rótulos.
10. Comparar os snapshots visuais com os anteriores.

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

- [X] Radix Dialog/Scroll Area/Select/Separator/Tabs em uso.
- [X] Hover Card e Tooltip instalados, sem UI nesta feature.
- [X] Overview com até 10 itens por categoria.
- [X] 10 work items = mais recentes atribuídos, ordenados por prioridade.
- [X] Nenhuma mudança visual não justificada.
- [X] Snapshots e axe aprovados.
- [X] Nenhum PAT exposto ou escrita no Azure DevOps.
- [X] Features 001–006 sem regressões.

## Resultado da implementação

- 2026-11-06: 162 testes unitários/integração/contrato passando, 57 arquivos.
- Cobertura: 88,79% statements, 72,35% branches, 93,02% functions,
  92,89% lines.
- E2E: 25 passando e 1 skip (credenciais reais), incluindo 10 itens,
  Scroll Area, portais, teclado e axe.
- Snapshots visuais existentes mantidos sem atualização.
- Hover Card e Tooltip continuam apenas como dependências instaladas; a
  integração (incluindo o texto fixo “10” no Hover Card) fica para feature futura.

## Observações

- “Relacionado a você” para PRs = revisor ou autor.
- A prioridade usa `Microsoft.VSTS.Common.Priority`; fallback `ChangedDate`.
- O layout fixo 900×700 e o titlebar customizado não mudam.
- Hover Card e Tooltip ficam para features futuras.
