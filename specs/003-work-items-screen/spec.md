# Feature Specification: Tela Work items

**Feature Branch**: `003-work-items-screen` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Criar a tela Work items com título, resumo, filtros e tabela, seguindo os detalhes do design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar os work items do contexto (Priority: P1)

Com configuração, projeto e time selecionados, o usuário aciona a aba **Work items** e
vê o título da tela, o resumo com Total/Backlog/Em andamento/Concluído e uma tabela
com os work items do projeto/time. Cada linha exibe ID, tipo, título, status, sprint e
uma ação para abrir o item no Azure DevOps.

**Why this priority**: é a visão operacional principal; permite acompanhar o trabalho
sem abrir o Azure DevOps e sem depender dos cards resumidos do Overview.

**Independent Test**: com dados no contexto, abrir a aba Work items e verificar o
resumo, a tabela com os campos documentados e o link de acesso de uma linha.

**Acceptance Scenarios**:

1. **Given** configuração e projeto/time válidos, **When** o usuário seleciona a aba
   **Work items**, **Then** a tela é exibida com título, resumo, filtros e tabela.
2. **Given** work items no contexto, **When** a tela carrega, **Then** o resumo mostra
   Total, Backlog, Em andamento e Concluído com as contagens corretas.
3. **Given** itens na tabela, **When** a tela carrega, **Then** cada linha exibe ID,
   Tipo, Título, Status, Sprint e Acessar, com o título quebrando em até duas linhas.
4. **Given** uma linha exibida, **When** o usuário aciona Acessar, **Then** o navegador
   padrão abre a página do work item no Azure DevOps, sem expor o PAT.
5. **Given** um status Em andamento, Backlog ou Concluído, **When** a linha é exibida,
   **Then** o status é legível por texto e cor com contraste acessível.

---

### User Story 2 - Encontrar work items com filtros (Priority: P2)

O usuário busca por ID ou título e filtra por Tipo, Responsável, Status e Sprint. Os
filtros são combinados e atualizam a tabela imediatamente, sem recarregar a tela.

**Why this priority**: em projetos com muitos itens, a tabela sem filtros não é
utilizável; os filtros são o que torna a tela produtiva.

**Independent Test**: com uma lista conhecida, aplicar cada filtro e a busca e conferir
que somente as linhas correspondentes permanecem na tabela.

**Acceptance Scenarios**:

1. **Given** a tabela carregada, **When** o usuário digita parte de um título ou ID,
   **Then** somente os itens correspondentes são exibidos.
2. **Given** os filtros disponíveis, **When** o usuário seleciona Tipo, Responsável,
   Status ou Sprint, **Then** a tabela aplica o filtro imediatamente.
3. **Given** múltiplos filtros ativos, **When** o usuário combina critérios, **Then**
   todos são aplicados em conjunto.
4. **Given** filtros sem resultados, **When** a tabela é atualizada, **Then** uma
   mensagem vazia explica que nenhum item corresponde aos critérios.
5. **Given** itens disponíveis, **When** os seletores são abertos, **Then** as opções
   são derivadas dos dados carregados, sem valores inventados.

---

### User Story 3 - Atualizar e reconhecer dados desatualizados (Priority: P3)

O usuário vê o horário da última atualização, aciona **Atualizar** e recebe os dados
mais recentes. Se os dados vierem do cache e estiverem vencidos, a tela informa que
estão desatualizados sem apagar o conteúdo.

**Why this priority**: consistência com o Overview e confiança nos dados exibidos.

**Independent Test**: acionar Atualizar e verificar o novo horário; simular cache
vencido e falha de rede e verificar o aviso de desatualizado.

**Acceptance Scenarios**:

1. **Given** a tela carregada, **When** o usuário aciona Atualizar, **Then** o resumo,
   a tabela e o horário do rodapé são atualizados.
2. **Given** cache válido, **When** a tela abre, **Then** o conteúdo aparece
   imediatamente e uma atualização em segundo plano não bloqueia a leitura.
3. **Given** cache vencido, **When** a tela abre, **Then** o conteúdo antigo é exibido
   com indicação de desatualizado e uma nova consulta é feita.
4. **Given** falha de rede, **When** existe cache, **Then** a tela mantém os dados com
   aviso; sem cache, exibe erro e ação de tentar novamente.
5. **Given** uma atualização em andamento, **When** o usuário aciona Atualizar
   novamente, **Then** não há chamadas duplicadas.

---

### Edge Cases

- Nenhum projeto/time selecionado; projeto sem work items.
- Mais itens do que o limite carregado; itens acima do limite não são exibidos.
- Título muito longo, campos ausentes, status desconhecido ou sprint não preenchida.
- Mais de um item com o mesmo título ou status.
- Filtros com acentos, maiúsculas/minúsculas e busca por `#ID`.
- Item removido ou alterado entre carregamentos.
- PAT expirado (401), sem escopo (401 após identidade válida), sem permissão (403),
  projeto inexistente (404), rate limit (429) e falha do serviço (5xx).
- Cache local vencido, corrompido ou de outro contexto.
- Troca de projeto/time durante uma atualização.
- Janela mínima de 900×700; tabela com rolagem vertical.
- Navegação apenas por teclado; leitor de tela; foco visível.
- Segunda instância e remoção da configuração.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aba **Work items** DEVE ser habilitada e navegável a partir do shell,
  mantendo o contexto de organização/projeto/time e a aba **Overview** funcional. As
  abas Pull requests e Pipelines permanecem indisponíveis nesta feature.
- **FR-002**: A tela DEVE exibir o título com o ícone `newspaper-line` e o texto
  "Work items", seguindo a análise manual de `screens.md`.
- **FR-003**: A tela DEVE exibir um resumo com quatro blocos — Total, Backlog, Em
  andamento e Concluído — com contagens calculadas a partir dos work items carregados
  no contexto. Total inclui todos os estados; os demais agrupam os estados
  correspondentes.
- **FR-004**: A tabela DEVE exibir as colunas ID, Tipo, Título, Status, Sprint e
  Acessar, com o título em até duas linhas e as linhas com a densidade documentada.
- **FR-005**: A tabela DEVE mostrar três linhas por vez na área desenhada, com rolagem
  vertical para os demais itens e cabeçalho fixo.
- **FR-006**: A tela DEVE carregar work items de todos os estados do projeto/time
  selecionado, ordenados por alteração mais recente, e não apenas os atribuídos ao
  usuário.
- **FR-007**: A busca DEVE filtrar por ID (com ou sem `#`) e por título, sem
  diferenciar maiúsculas/minúsculas.
- **FR-008**: Os filtros Tipo, Responsável, Status e Sprint DEVEM ser derivados dos
  itens carregados e combinados com a busca.
- **FR-009**: Filtros sem resultado DEVEM exibir uma mensagem vazia clara, mantendo o
  resumo e os controles visíveis.
- **FR-010**: A ação Acessar DEVE abrir o work item no Azure DevOps em nova página do
  navegador padrão, por meio de link HTTPS permitido, com rótulo acessível.
- **FR-011**: A tela DEVE ter estados de carregamento, erro e vazio independentes do
  restante do shell; erro DEVE oferecer "Tentar novamente".
- **FR-012**: O rodapé DEVE exibir "Atualizado em DD/MM/AAAA às HH:MMh", indicador de
  dados desatualizados e ação "Atualizar".
- **FR-013**: Os dados DEVEM ser cacheados cifrados por 5 minutos, associados à
  organização/projeto/time; a atualização manual ignora o cache e evita chamadas
  duplicadas.
- **FR-014**: Em falha de rede/429/5xx com cache disponível, a tela DEVE exibir o
  cache com staleness; sem cache, exibir erro acionável.
- **FR-015**: O cache DEVE ser limpo na troca de organização, remoção da configuração
  e mudança de contexto, conforme as features anteriores.
- **FR-016**: A tela NÃO DEVE executar operações de escrita no Azure DevOps; a única
  exceção read-only é a consulta WIQL já registrada na ADR-0011.
- **FR-017**: O PAT NÃO DEVE ser exibido, enviado à interface, gravado em logs,
  incluído em URLs ou exposto em diagnóstico.
- **FR-018**: A tela DEVE seguir layout, tipografia, cores, espaçamentos, ícones e
  textos de `docs/design/`, usando tokens/componentes existentes; correções de
  contraste DEVEM ser registradas.
- **FR-019**: A tela DEVE atender WCAG 2.2 AA: tabela com semântica, cabeçalhos
  associados, filtros rotulados, foco visível, status por texto e contraste adequado.
- **FR-020**: Datas e números DEVEM usar formato pt-BR; campos ausentes DEVEM ter
  fallback textual sem quebrar a tabela.
- **FR-021**: A tela DEVE limitar a quantidade carregada a 2.000 work items para
  proteger tempo e taxa da API; acima disso, o resumo e a tabela refletem o conjunto
  carregado e a interface informa o limite.
- **FR-022**: A navegação entre Overview e Work items DEVE preservar o projeto/time
  selecionado e não disparar consultas duplicadas.

### Key Entities *(include if feature involves data)*

- **Contexto de trabalho**: organização, projeto e time selecionados.
- **Work item da tabela**: ID, tipo, título, status, sprint/iteração, responsável,
  data da última alteração e URL de acesso.
- **Resumo de work items**: total, backlog, em andamento, concluído.
- **Snapshot de work items**: itens, contexto, instante da coleta, validade e
  indicador de desatualizado.
- **Filtros**: busca textual, tipo, responsável, status e sprint.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com cache válido, a tela Work items exibe o resumo e a tabela em menos
  de 2 segundos; com consulta à API, em menos de 8 segundos em 95% das aberturas.
- **SC-002**: 100% das linhas exibem ID, tipo, título, status, sprint e ação de acesso
  sem corte de conteúdo no tamanho mínimo de janela.
- **SC-003**: A busca e cada filtro reduzem a tabela ao conjunto correto em menos de
  200 ms para até 2.000 itens carregados.
- **SC-004**: O usuário abre qualquer item no Azure DevOps com um clique e 100% dos
  links gerados abrem a página correta.
- **SC-005**: Após Atualizar, resumo, tabela e horário refletem os dados novos em até
  8 segundos, sem chamadas duplicadas concorrentes.
- **SC-006**: Nenhuma operação de escrita é enviada e nenhum PAT é exposto.
- **SC-007**: A tela não apresenta violações críticas/sérias de acessibilidade e pode
  ser operada apenas por teclado.
- **SC-008**: A suíte das features 001 e 002 continua passando sem regressões.

## Assumptions

- A análise manual de `screens.md` (título, resumo, filtros e tabela) prevalece sobre
  o export antigo `19:237`, que não mostra título/abas; a divergência fica registrada
  em `docs/design/gaps.md`.
- O shell mantém abas e seletores de projeto/time no cabeçalho, conforme a seção
  "Shell comum" de `screens.md` e a implementação da feature 002.
- Work items de todos os estados são carregados; o resumo classifica estados
  conhecidos e estados personalizados entram apenas no Total.
- Sprint é o último segmento de `System.IterationPath`; ausente vira "—".
- O limite de 2.000 itens é uma proteção operacional; ampliar exige decisão de
  performance/design.
- A tabela mostra três linhas por vez, com rolagem; não há paginação desenhada.
- O resumo não reage aos filtros; ele representa o contexto carregado.
- Links usam o navegador padrão e a allowlist de hosts das features anteriores.
- O app continua desktop-only, read-only, instância única, PT-BR e Windows 10/11 x64.
