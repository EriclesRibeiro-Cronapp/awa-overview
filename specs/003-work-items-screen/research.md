# Research — Tela Work items

## Decisões

### 1. Escopo dos dados

- **Decisão**: carregar work items de **todos os estados** do projeto/time
  selecionado, não apenas os atribuídos ao usuário.
- **Rationale**: a tela tem filtro de Responsável e resumo com Concluído; o card do
  Overview continua sendo o recorte "atribuído a mim".
- **WIQL**:
  ```sql
  SELECT [System.Id] FROM WorkItems
  WHERE [System.TeamProject] = @project
    [AND [System.AreaPath] UNDER '<Projeto>\<Time>']
  ORDER BY [System.ChangedDate] DESC
  ```
- **Time**: usa `teamfieldvalues`; se indisponível, cai para o projeto.

### 2. Paginação e limite

- **Decisão**: buscar IDs no WIQL e carregar os campos em lotes de 200; máximo de
  2.000 itens.
- **Rationale**: `GET /wit/workitems` aceita até 200 IDs por chamada. 2.000 cobre o
  mock e limita latência/rate limit.
- **Acima do limite**: carregar os 2.000 mais recentes e sinalizar truncamento; o
  resumo reflete o conjunto carregado.
- **Alternativas**: carregar tudo (risco de 429 e lentidão); paginação visual (não
  desenhada).

### 3. Campos

- `System.Id`, `System.WorkItemType`, `System.Title`, `System.State`,
  `System.IterationPath`, `System.AssignedTo`, `System.ChangedDate`.
- Sprint: último segmento de `System.IterationPath`.
- URL: `https://dev.azure.com/{org}/{project}/_workitems/edit/{id}`.

### 4. Resumo

- **Total**: todos os itens carregados.
- **Backlog**: `New`, `Backlog`, `Approved`, `To Do`, `Proposed`.
- **Em andamento**: `Active`, `In Progress`, `Doing`, `Committed`.
- **Concluído**: `Closed`, `Done`, `Resolved`, `Completed`.
- Estados personalizados entram somente no Total.
- O resumo **não** reage aos filtros; representa o contexto carregado.

### 5. Filtros

- **Decisão**: filtros client-side sobre os itens carregados.
- Busca por ID (com/sem `#`) e título, case-insensitive.
- Opções de Tipo, Responsável, Status e Sprint derivadas dos dados, ordenadas
  alfabeticamente; valor vazio = todos.
- Combinação em AND; mensagem vazia quando não há correspondência.
- **Rationale**: até 2.000 itens, filtragem local é imediata e evita chamadas.

### 6. Tabela e densidade

- **Decisão**: grid de 6 colunas `1fr 1fr 5fr 2fr 1fr 1fr`, gap 8px; cabeçalho e
  linhas de 47px; três linhas visíveis (188px = 4×47) e rolagem vertical no corpo.
- Cabeçalho fixo (`position: sticky`); título em até duas linhas.
- Sem linhas divisórias entre registros, como no design.
- Acesso com `share-circle-line` 16px e rótulo acessível.

### 7. Cores e acessibilidade

- Textos secundários do design `#7F91A4` e status `#418BDA`/`#7EA426` não passam AA
  sobre `#FBFBFB`; usar `#386089`, `#005A9E` e `#4F7A00`.
- Cabeçalho da tabela em `#386089` bold 12px; status por texto + cor.
- Tabela com `<table>`, `<th scope="col">`, `<caption class="visually-hidden">`.
- Região de rolagem com `tabIndex=0` e rótulo.

### 8. Navegação e contexto

- **Decisão**: elevar `useProjectContext` para um `ConfiguredApp`; as páginas
  Overview e Work items recebem o mesmo contexto/estado.
- `ProductTabs` passa a receber `activeId` e `onSelect`; Work items habilitada,
  Pull requests/Pipelines desabilitadas.
- Trocar de aba não recria seleção nem dispara consultas duplicadas; TanStack Query
  mantém cache por chave.
- **Rationale**: hoje o contexto é local ao Overview; sem elevar, a seleção se
  perderia ao navegar.

### 9. Cache

- **Decisão**: `WorkItemsCacheService` com `work-items-cache.json.enc`, TTL 300s,
  chave `org|projeto|time`.
- **Rationale**: o volume da lista é maior que o Overview; cache separado evita
  invalidar um ao atualizar o outro.
- **Invalidação**: troca de organização/remoção e troca de contexto.
- **Fallback**: erro de rede/429/5xx com cache → dados stale; sem cache → erro.

### 10. Design divergente

- O export `board-work-items--19-237.png` não mostra título nem abas; a análise
  manual revisada em 01/11 documenta título, resumo, filtros e tabela.
- **Decisão**: seguir a análise manual e registrar a divergência em
  `docs/design/gaps.md` (G-25), pois ela reflete a versão mais recente do Figma.
- O shell segue a seção "Shell comum": cabeçalho com seletores e abas.

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Muitos work items | Lote de 200, limite 2.000 e cache |
| Rate limit | TTL, chamadas sequenciais em lote e retry |
| Time sem area path | Fallback para projeto |
| Filtros lentos | Filtragem local e limite de 2.000 |
| Perda de seleção ao navegar | Contexto elevado no shell |
| Contraste do design | Tokens acessíveis registrados em gaps |
| Export antigo sem título/abas | Análise manual prevalece; G-25 |
