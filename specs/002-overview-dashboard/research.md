# Research — Tela Overview

## Decisões

### 1. Identidade do usuário

- **Decisão**: obter `authenticatedUser.id` e `providerDisplayName` em
  `GET /connectionData?api-version=7.1-preview.1` e usar o `id` para filtrar PRs
  do revisor e o nome para exibição.
- **Rationale**: a consulta de work items usa `@Me`; a de PRs exige um identificador
  estável do revisor. `connectionData` já é usado na validação e é a fonte oficial
  da identidade autenticada.
- **Alternativas**: decodificar o PAT (impossível, não contém identidade); usar
  `searchCriteria.creatorId` (não representa "precisa da minha atenção").
- **Atenção**: o endpoint é preview-only; `api-version=7.1` retorna 400. Usar
  `7.1-preview.1` e enviar `X-TFS-FedAuthRedirect: Suppress`.

### 2. Work items atribuídos ao usuário

- **Decisão**: consultar com WIQL no escopo do projeto e, quando houver time,
  filtrar pela area path do time; depois buscar os campos em lote.
- **Consulta**:
  ```sql
  SELECT [System.Id] FROM WorkItems
  WHERE [System.TeamProject] = @project
    AND [System.AssignedTo] = @Me
    AND [System.State] NOT IN ('Closed', 'Done', 'Removed')
    [AND [System.AreaPath] UNDER '<Projeto>\<Time>']
  ORDER BY [System.ChangedDate] DESC
  ```
- **Endpoints**:
  - `POST /{project}/_apis/wit/wiql?api-version=7.1` com `{ "query": "..." }`.
  - `GET /_apis/wit/workitems?ids=...&fields=...&api-version=7.1`.
  - `GET /{project}/{team}/_apis/work/teamsettings/teamfieldvalues?api-version=7.1`
    para obter a area path do time.
- **Rationale**: WIQL é a única forma de descobrir itens atribuídos sem exigir uma
  consulta salva; a consulta é somente leitura e não altera dados.
- **Alternativas**: exigir uma consulta salva (ruim para o usuário); varrer todos
  os projetos e filtrar localmente (caro e limitado).
- **Trade-off**: `POST` é usado apenas para consulta. A ADR-0011 registra a exceção
  ao contrato "sem escrita"; o cliente não expõe nenhum método de mutação.

### 3. Escopo de time

- **Decisão**: aplicar time apenas aos work items, via area path retornada por
  `teamfieldvalues`. PRs e pipelines são escopados ao projeto.
- **Rationale**: PRs e builds não pertencem a times de forma inequívoca no Azure
  DevOps; o design mostra "Projeto" nesses cards. Work items são naturalmente
  organizados por area path.
- **Fallback**: se o time não tiver area path ou a consulta falhar, usar o projeto
  inteiro e registrar o fallback no log.

### 4. Pull request que precisa de atenção

- **Decisão**: `GET /{project}/_apis/git/pullrequests?searchCriteria.status=active&searchCriteria.reviewerId={userId}&$top=10&api-version=7.1`.
  Filtrar localmente PRs em que o voto do usuário não é `10` (aprovado), ordenar
  por `creationDate` desc e escolher o mais recente.
- **Rationale**: o endpoint já filtra por revisor; o voto diferencia "aguardando
  aprovação" de "aprovado".
- **Alternativas**: buscar todos os PRs ativos e filtrar localmente (mais chamadas
  e ruído).

### 5. Pipeline recente

- **Decisão**: `GET /{project}/_apis/build/builds?$top=1&queryOrder=finishTimeDescending&api-version=7.1`.
- **Rationale**: uma única chamada entrega a execução mais recente do projeto, com
  `definition.name`, `status`, `result`, `startTime`/`queueTime` e `_links.web.href`.
- **Mapeamento**: `succeeded` → Sucesso; `failed` → Falha; `partiallySucceeded` →
  Parcial; `canceled` → Cancelado; `inProgress` → Em andamento; `notStarted` →
  Na fila.

### 6. Cache

- **Decisão**: snapshot próprio `overview-cache.json.enc`, AES-256-GCM, chave do
  `safeStorage`, TTL de 300s, chave de contexto
  `organização|projeto|time`. Reutilizar um pequeno `EncryptedJsonStore` genérico
  para não duplicar a criptografia.
- **Rationale**: o cache de projetos/times tem outro ciclo de vida; separar evita
  invalidar projetos ao atualizar o Overview.
- **Fallback**: em erro de rede/429/5xx, devolver o card cacheado com `stale=true`;
  em cache ausente, devolver erro do card.
- **Invalidação**: troca de organização/remoção já limpa o cache de projetos; o
  Overview também deve ser limpo nesses eventos e ao trocar o contexto.

### 7. Estado e carregamento no renderer

- **Decisão**: TanStack Query com chave `['overview', org, projectId, teamId]`,
  `staleTime` de 5 minutos e `refetchOnWindowFocus` habilitado. O botão "Atualizar"
  chama `load({ force: true })` e fica desabilitado durante `isFetching`.
- **Rationale**: reaproveita o cache em memória, evita chamadas duplicadas e
  preserva dados enquanto o contexto não muda.
- **Concorrência**: descartar respostas de contexto antigo; `cancelRefetch: false`
  no refresh manual para não duplicar.

### 8. Abas

- **Decisão**: `role="tablist"`; Overview é a única aba selecionável. As demais
  ficam com `aria-disabled="true"` e `tabIndex=-1`, com texto acessível "em breve".
- **Rationale**: o design exige as abas, mas as telas não fazem parte desta feature;
  evitar navegação para placeholders vazios.
- **Trade-off**: a aba indisponível não deve parecer um link ativo; usar cor
  secundária acessível e não interceptar clique.

### 9. Ícones e acessibilidade

- **Decisão**: copiar os SVGs documentados para `src/renderer/assets/icons/` e
  renderizar via componente `Icon` com `currentColor`. Corrigir contrastes de abas,
  tags e textos secundários para AA.
- **Rationale**: os SVGs do Figma têm `fill` fixo; `currentColor` permite hover,
  foco e estados sem alterar a geometria.
- **Alternativas**: usar fonte de ícones (perde fidelidade) ou imagens (não herdam
  cor).

### 10. Formatação de data e links

- **Decisão**: formatar com `Intl.DateTimeFormat('pt-BR', { dateStyle:'short', timeStyle:'short' })`
  e sufixo `h`, conforme o design. Links externos usam `shell.openExternal` no main,
  com allowlist de host `dev.azure.com` e `*.visualstudio.com`.
- **Rationale**: consistência regional e segurança contra URLs arbitrárias.
- **Alternativas**: abrir link no renderer (viola isolamento e permite navegação
  indevida).

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| WIQL lento em organizações grandes | Limite de 3 itens, escopo por projeto/time e timeout de 15s |
| PR API não suportar `reviewerId` em algum cenário | Fallback para `$top=50` e filtro local pelo `reviewers` |
| Area path do time ausente | Fallback para escopo do projeto |
| Rate limit ao abrir Overview | Cache de 5 min, chamadas em paralelo e retry com `Retry-After` |
| Cache de contexto antigo exibido após troca | Chave de contexto e descarte de respostas obsoletas |
| Ícones sem assets | SVGs documentados em `docs/design/assets/icons` |
