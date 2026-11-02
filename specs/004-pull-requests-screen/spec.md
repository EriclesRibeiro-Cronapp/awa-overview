# Feature Specification: Tela Pull requests

**Feature Branch**: `004-pull-requests-screen` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Criar a tela Pull requests com busca, filtro de status e tabela, seguindo os detalhes do design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar pull requests do projeto (Priority: P1)

Com configuração, projeto e time selecionados, o usuário aciona a aba **Pull requests**
e vê o título da tela, a busca, o filtro de Status e uma tabela com os pull requests
do projeto. Cada linha exibe ID, Título, Status e Acessar.

**Why this priority**: é a próxima visão operacional depois dos work items e permite
acompanhar revisões sem abrir o Azure DevOps.

**Independent Test**: com dados no contexto, abrir a aba Pull requests e verificar a
tabela com as colunas e status documentados e o link de acesso.

**Acceptance Scenarios**:

1. **Given** configuração e projeto/time válidos, **When** o usuário seleciona a aba
   **Pull requests**, **Then** a tela é exibida com título, busca, filtro e tabela.
2. **Given** pull requests no projeto, **When** a tela carrega, **Then** cada linha
   exibe `!ID`, Título, Status e Acessar.
3. **Given** um PR aberto, concluído ou abandonado, **When** a linha é exibida,
   **Then** o status aparece como "Aberto", "Concluído" ou "Abandonado", legível por
   texto e cor.
4. **Given** uma linha exibida, **When** o usuário aciona Acessar, **Then** o navegador
   padrão abre o PR no Azure DevOps, sem expor o PAT.
5. **Given** a aba Work items ativa, **When** o usuário seleciona Pull requests,
   **Then** o contexto de projeto/time é preservado.

---

### User Story 2 - Buscar e filtrar por status (Priority: P2)

O usuário busca por ID ou título do PR e filtra por Status. Os critérios são
combinados e atualizam a tabela imediatamente.

**Why this priority**: projetos com muitos PRs exigem busca e filtro para localizar
revisões relevantes.

**Independent Test**: com uma lista conhecida, aplicar busca e cada status e conferir
as linhas resultantes.

**Acceptance Scenarios**:

1. **Given** a tabela carregada, **When** o usuário digita parte do título ou `!ID`,
   **Then** somente os PRs correspondentes são exibidos.
2. **Given** o filtro Status, **When** o usuário escolhe Aberto, Concluído ou
   Abandonado, **Then** a tabela mostra somente aquele status.
3. **Given** busca e status ativos, **When** os critérios são combinados, **Then**
   ambos são aplicados.
4. **Given** critérios sem resultado, **When** a tabela é atualizada, **Then** uma
   mensagem vazia explica que nenhum PR corresponde.

---

### User Story 3 - Atualizar e reconhecer dados desatualizados (Priority: P3)

O usuário vê o horário da última atualização, aciona **Atualizar** e recebe os dados
mais recentes; cache vencido é indicado sem apagar o conteúdo.

**Why this priority**: consistência com Overview e Work items e confiança nos dados.

**Independent Test**: acionar Atualizar e verificar o horário; simular cache vencido
e falha de rede e conferir o aviso de desatualizado.

**Acceptance Scenarios**:

1. **Given** a tela carregada, **When** o usuário aciona Atualizar, **Then** a tabela
   e o horário do rodapé são atualizados.
2. **Given** cache válido, **When** a tela abre, **Then** o conteúdo aparece
   imediatamente e a atualização em segundo plano não bloqueia a leitura.
3. **Given** cache vencido, **When** a tela abre, **Then** o conteúdo antigo é exibido
   com indicação de desatualizado e uma nova consulta é feita.
4. **Given** falha de rede com cache, **When** a atualização falha, **Then** os dados
   permanecem com aviso; sem cache, há erro e ação de tentar novamente.
5. **Given** atualização em andamento, **When** o usuário aciona Atualizar
   novamente, **Then** não há chamadas duplicadas.

---

### Edge Cases

- Nenhum projeto/time selecionado; projeto sem pull requests.
- PR com título muito longo, status desconhecido, data ausente ou repositório removido.
- Busca por `!54678`, `54678`, título parcial ou acentos.
- Mais PRs que o limite carregado.
- PR removido/alterado entre carregamentos.
- PAT expirado (401), sem escopo (401 após identidade válida), sem permissão (403),
  projeto inexistente (404), rate limit (429) e falha do serviço (5xx).
- Cache vencido, corrompido ou de outro contexto.
- Troca de projeto/time durante atualização.
- Janela mínima de 900×700; tabela com rolagem vertical.
- Navegação apenas por teclado; leitor de tela; foco visível.
- Segunda instância e remoção da configuração.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aba **Pull requests** DEVE ser habilitada e navegável, preservando o
  contexto de organização/projeto/time. Overview e Work items continuam funcionais;
  Pipelines permanece indisponível.
- **FR-002**: A tela DEVE exibir o título com o ícone `git-pull-request-line` e o texto
  "Pull requests".
- **FR-003**: A tela DEVE exibir uma busca de 499×28 com placeholder
  "Buscar por ID ou título do PR..." e um filtro de Status alinhado à direita.
- **FR-004**: A tabela DEVE exibir as colunas ID, Título, Status e Acessar, com
  cabeçalho de 41px e linhas de 49px, mostrando três linhas visíveis e rolagem
  vertical para os demais PRs.
- **FR-005**: O ID DEVE ser exibido com prefixo `!` (ex.: `!54678`).
- **FR-006**: O Status DEVE ser exibido como texto "Aberto", "Concluído" ou
  "Abandonado", com cores acessíveis; não usar pílula de fundo.
- **FR-007**: A busca DEVE filtrar por ID (com/sem `!`) e título, sem diferenciar
  maiúsculas/minúsculas.
- **FR-008**: O filtro Status DEVE oferecer Todos, Aberto, Concluído e Abandonado e
  ser combinado com a busca.
- **FR-009**: Critérios sem resultado DEVEM exibir uma mensagem vazia clara, mantendo
  controles visíveis.
- **FR-010**: A ação Acessar DEVE abrir o PR no Azure DevOps por HTTPS permitido, com
  rótulo acessível.
- **FR-011**: A tela DEVE ter estados de carregamento, erro e vazio, com "Tentar
  novamente" no erro.
- **FR-012**: O rodapé DEVE exibir "Atualizado em DD/MM/AAAA às HH:MMh", indicador de
  desatualizado e ação "Atualizar".
- **FR-013**: Os dados DEVEM ser cacheados cifrados por 5 minutos, associados ao
  contexto; a atualização manual ignora o cache e evita chamadas duplicadas.
- **FR-014**: Em falha de rede/429/5xx com cache, exibir o cache com staleness; sem
  cache, erro acionável.
- **FR-015**: O cache DEVE ser limpo na troca de organização, remoção da configuração
  e mudança de contexto.
- **FR-016**: A aplicação NÃO DEVE executar operações de escrita; PRs são somente
  leitura.
- **FR-017**: O PAT NÃO DEVE ser exibido, enviado à interface, gravado em logs,
  incluído em URLs ou exposto em diagnóstico.
- **FR-018**: A tela DEVE seguir layout, tipografia, cores, espaçamentos e ícones de
  `docs/design/`, usando tokens/componentes existentes; correções de contraste DEVEM
  ser registradas.
- **FR-019**: A tela DEVE atender WCAG 2.2 AA: tabela semântica, filtros rotulados,
  foco visível, status por texto e contraste adequado.
- **FR-020**: Campos ausentes DEVEM ter fallback textual sem quebrar a tabela.
- **FR-021**: A tela DEVE limitar o carregamento a 1.000 PRs para proteger tempo e
  taxa da API; acima disso, informar o limite.
- **FR-022**: A navegação entre abas DEVE preservar o projeto/time e não disparar
  consultas duplicadas.

### Key Entities *(include if feature involves data)*

- **Contexto de trabalho**: organização, projeto e time selecionados.
- **Pull request da tabela**: ID, título, status, projeto, data de criação e URL.
- **Filtros**: busca textual e status.
- **Snapshot de pull requests**: itens, contexto, instante da coleta, validade e
  indicador de desatualizado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com cache válido, a tela exibe a tabela em menos de 2 segundos; com
  consulta à API, em menos de 8 segundos em 95% das aberturas.
- **SC-002**: 100% das linhas exibem `!ID`, título, status e acesso sem corte no
  tamanho mínimo de janela.
- **SC-003**: Busca e filtro de status respondem em menos de 200 ms para até 1.000 PRs.
- **SC-004**: O usuário abre qualquer PR com um clique e 100% dos links abrem a página
  correta.
- **SC-005**: Após Atualizar, tabela e horário refletem os dados novos em até 8
  segundos, sem chamadas duplicadas.
- **SC-006**: Nenhuma escrita é enviada e nenhum PAT é exposto.
- **SC-007**: A tela não apresenta violações críticas/sérias de acessibilidade e pode
  ser operada apenas por teclado.
- **SC-008**: A suíte das features 001–003 continua passando sem regressões.

## Assumptions

- Não há screenshot/export específico da tela Pull requests em `docs/design/assets`;
  a análise manual de `screens.md` é a fonte, reutilizando a estrutura de Work items.
- O shell mantém abas e seletores de projeto/time no cabeçalho, conforme a feature 002.
- São carregados PRs de todos os status do projeto selecionado, ordenados por criação
  mais recente; o time não altera o escopo de PRs.
- Limite de 1.000 PRs; ampliar exige decisão de performance/design.
- A tabela mostra três linhas por vez (41px + 3×49px = 188px) com rolagem.
- O status "Aberto" usa amarelo escurecido para AA; a correção é registrada em gaps.
- Links usam o navegador padrão e a allowlist existente.
- O app continua desktop-only, read-only, instância única, PT-BR e Windows 10/11 x64.
