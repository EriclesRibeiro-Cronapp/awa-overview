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

- [ ] Radix Dialog/Scroll Area/Select/Separator/Tabs em uso.
- [ ] Hover Card e Tooltip instalados, sem UI nesta feature.
- [ ] Overview com até 10 itens por categoria.
- [ ] 10 work items = mais recentes atribuídos, ordenados por prioridade.
- [ ] Nenhuma mudança visual não justificada.
- [ ] Snapshots e axe aprovados.
- [ ] Nenhum PAT exposto ou escrita no Azure DevOps.
- [ ] Features 001–006 sem regressões.

## Observações

- “Relacionado a você” para PRs = revisor ou autor.
- A prioridade usa `Microsoft.VSTS.Common.Priority`; fallback `ChangedDate`.
- O layout fixo 900×700 e o titlebar customizado não mudam.
- Hover Card e Tooltip ficam para features futuras.
