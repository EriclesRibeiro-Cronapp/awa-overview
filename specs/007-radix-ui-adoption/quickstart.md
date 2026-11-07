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

1. Abrir a aplicação e confirmar que o layout, cores, tipografia, ícones, titlebar,
   footer e janela 900×700 estão idênticos ao estado anterior.
2. Abrir Configurações e a confirmação de remoção:
   - Tab/Shift+Tab, ESC, foco preso e restauração;
   - overlay e footer iguais.
3. Em cada card da Overview, passar o mouse e focar o ícone `spam-line`:
   - Work items: “Últimos 10 work items associados a você por prioridade”;
   - Pipelines: “Últimos 10 pipelines ordenado por data de inicialização.”;
   - Pull requests: “Últimos 10 pull requests relacionados a você.”.
   - O texto deve continuar “10” mesmo com zero itens.
4. Confirmar que cada card carrega até 10 itens e que o corpo rola com o cabeçalho e
   o separador fixos.
5. Confirmar que a Scroll Area não altera o tamanho dos cards (326×550 e 526×271).
6. Abrir todos os selects (projeto, time, filtros de Work items e Status de Pull
   requests), navegar por teclado e confirmar valores/persistência.
7. Navegar pelas abas por clique e setas; confirmar aba ativa e telas.
8. Confirmar que nenhum tooltip novo aparece.
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

- [ ] Radix Dialog/Hover Card/Scroll Area/Select/Separator/Tabs em uso.
- [ ] Tooltip instalado sem uso visual.
- [ ] Hover Cards com texto fixo em 10.
- [ ] Overview com até 10 itens por categoria.
- [ ] Nenhuma mudança visual não justificada.
- [ ] Snapshots e axe aprovados.
- [ ] Nenhum PAT exposto ou escrita no Azure DevOps.
- [ ] Features 001–006 sem regressões.

## Observações

- O Hover Card é apenas textual; não lista os itens.
- “Relacionado a você” para PRs = revisor ou autor.
- A prioridade de work items usa o campo do Azure DevOps com fallback para alteração.
- O layout fixo 900×700 e o titlebar customizado não mudam.
