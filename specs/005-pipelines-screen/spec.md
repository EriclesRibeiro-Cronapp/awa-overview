# Feature Specification: Tela Pipelines

**Feature Branch**: `005-pipelines-screen` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Criar a tela Pipelines com busca, status, duração e tabela, seguindo os detalhes do design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar execuções de pipeline (Priority: P1)

Com configuração, projeto e time selecionados, o usuário aciona a aba **Pipelines** e
vê o título da tela, a busca e uma tabela com as execuções recentes do projeto. Cada
linha exibe status, nome do pipeline, detalhes, data de execução, duração e acesso.

**Why this priority**: completa a visão operacional do produto e permite acompanhar
builds sem abrir o Azure DevOps.

**Independent Test**: com dados no contexto, abrir a aba Pipelines e verificar a
tabela com status, nome, detalhes, data, duração e link.

**Acceptance Scenarios**:

1. **Given** configuração e projeto válidos, **When** o usuário seleciona a aba
   **Pipelines**, **Then** a tela é exibida com título, busca e tabela.
2. **Given** execuções recentes, **When** a tela carrega, **Then** cada linha exibe
   o status com ícone, nome, detalhes, data, duração e Acessar.
3. **Given** uma execução concluída com sucesso ou falha, **When** a linha é exibida,
   **Then** o status é comunicado por ícone e rótulo acessível, não apenas por cor.
4. **Given** uma execução em andamento, **When** a linha é exibida, **Then** a
   duração aparece como "—" e o status como "Em andamento".
5. **Given** uma linha exibida, **When** o usuário aciona Acessar, **Then** o
   navegador padrão abre a execução no Azure DevOps, sem expor o PAT.

---

### User Story 2 - Encontrar pipelines pela busca (Priority: P2)

O usuário busca pelo nome ou detalhes do pipeline; a tabela é filtrada imediatamente.

**Why this priority**: projetos com muitos pipelines exigem busca para localizar a
execução relevante.

**Independent Test**: com uma lista conhecida, digitar parte do nome e conferir que
somente as execuções correspondentes permanecem.

**Acceptance Scenarios**:

1. **Given** a tabela carregada, **When** o usuário digita parte do nome, **Then**
   somente as execuções correspondentes são exibidas.
2. **Given** a busca por detalhes/descrição, **When** o texto coincide, **Then** a
   execução é exibida.
3. **Given** busca sem resultado, **When** a tabela é atualizada, **Then** uma
   mensagem vazia explica que nenhum pipeline corresponde.

---

### User Story 3 - Atualizar e reconhecer dados desatualizados (Priority: P3)

O usuário vê o horário da última atualização, aciona **Atualizar** e recebe os dados
mais recentes; cache vencido é indicado sem apagar o conteúdo.

**Why this priority**: consistência com as demais telas e confiança nos dados.

**Independent Test**: acionar Atualizar e verificar o horário; simular cache vencido
e falha de rede e conferir o aviso.

**Acceptance Scenarios**:

1. **Given** a tela carregada, **When** o usuário aciona Atualizar, **Then** a tabela
   e o horário do rodapé são atualizados.
2. **Given** cache válido, **When** a tela abre, **Then** o conteúdo aparece
   imediatamente.
3. **Given** cache vencido, **When** a tela abre, **Then** o conteúdo antigo é
   exibido com indicação de desatualizado e uma nova consulta é feita.
4. **Given** falha de rede com cache, **When** a atualização falha, **Then** os dados
   permanecem com aviso; sem cache, há erro e retry.
5. **Given** atualização em andamento, **When** o usuário aciona Atualizar
   novamente, **Then** não há chamadas duplicadas.

---

### Edge Cases

- Nenhum projeto/time selecionado; projeto sem pipelines.
- Execução sem `finishTime` (em andamento/na fila), duração ausente ou data inválida.
- Definição de pipeline sem descrição.
- Nome/detalhe muito longo; mais execuções que o limite.
- Status desconhecido/cancelado/parcial.
- Busca com acentos, maiúsculas/minúsculas e espaços.
- PAT expirado (401), sem escopo de Build (401 após identidade válida), sem permissão
  (403), projeto inexistente (404), rate limit (429) e falha do serviço (5xx).
- Cache vencido, corrompido ou de outro contexto.
- Troca de projeto/time durante atualização.
- Janela mínima de 900×700; tabela com rolagem.
- Navegação apenas por teclado; leitor de tela; foco visível.
- Segunda instância e remoção da configuração.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aba **Pipelines** DEVE ser habilitada e navegável, preservando o
  contexto. Overview, Work items e Pull requests continuam funcionais.
- **FR-002**: A tela DEVE exibir o título com o ícone `rocket-2-line` e o texto
  "Pipelines".
- **FR-003**: A tela DEVE exibir uma busca de 499×28 com placeholder
  "Buscar por pipeline...".
- **FR-004**: A tabela DEVE exibir as colunas Pipeline, Detalhes, Executado em e
  Acessar, com três linhas visíveis e rolagem vertical.
- **FR-005**: A coluna Pipeline DEVE exibir ícone de status + nome em semibold.
- **FR-006**: A coluna Detalhes DEVE exibir a descrição da definição do pipeline; se
  ausente, usar o número da execução ou "—".
- **FR-007**: A coluna Executado em DEVE exibir data/hora e duração, com ícones
  `calendar-2-line` e `timer-line`; execuções sem fim usam "—" na duração.
- **FR-008**: O status DEVE ser representado por ícone e rótulo acessível:
  sucesso (`checkbox-circle-line`), falha (`close-circle-line`), parcial, cancelado,
  em andamento, na fila ou desconhecido.
- **FR-009**: A busca DEVE filtrar por nome e detalhes do pipeline, sem diferenciar
  maiúsculas/minúsculas.
- **FR-010**: A ação Acessar DEVE abrir a execução no Azure DevOps por HTTPS
  permitido, com rótulo acessível.
- **FR-011**: A tela DEVE ter estados de carregamento, erro e vazio, com "Tentar
  novamente" no erro.
- **FR-012**: O rodapé DEVE exibir "Atualizado em DD/MM/AAAA às HH:MMh", indicador de
  desatualizado e ação "Atualizar".
- **FR-013**: Os dados DEVEM ser cacheados cifrados por 5 minutos, associados ao
  contexto; a atualização manual ignora o cache e evita chamadas duplicadas.
- **FR-014**: Em falha de rede/429/5xx com cache, exibir o cache com staleness; sem
  cache, erro acionável.
- **FR-015**: O cache DEVE ser limpo na troca de organização, remoção e mudança de
  contexto.
- **FR-016**: A aplicação NÃO DEVE executar operações de escrita no Azure DevOps;
  builds são somente leitura.
- **FR-017**: O PAT NÃO DEVE ser exibido, enviado à interface, gravado em logs,
  incluído em URLs ou exposto em diagnóstico.
- **FR-018**: A tela DEVE seguir layout, tipografia, cores, espaçamentos e ícones de
  `docs/design/`; correções de contraste DEVEM ser registradas.
- **FR-019**: A tela DEVE atender WCAG 2.2 AA: tabela semântica, busca rotulada, foco
  visível, status por ícone + rótulo e contraste adequado.
- **FR-020**: A tela DEVE limitar o carregamento a 500 execuções para proteger tempo e
  taxa da API; acima disso, informar o limite.
- **FR-021**: A navegação entre abas DEVE preservar o projeto/time e não disparar
  consultas duplicadas.
- **FR-022**: A descrição do pipeline DEVE vir da definição e ser associada à execução
  pelo ID da definição; ausência não pode quebrar a tabela.

### Key Entities *(include if feature involves data)*

- **Contexto de trabalho**: organização, projeto e time selecionados.
- **Execução de pipeline**: ID, nome, descrição, status, resultado, início, fim,
  duração e URL.
- **Snapshot de pipelines**: execuções, contexto, instante, validade e staleness.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com cache válido, a tela exibe a tabela em menos de 2 segundos; com API,
  em menos de 8 segundos em 95% das aberturas.
- **SC-002**: 100% das linhas exibem pipeline, detalhes, data, duração e acesso sem
  corte no tamanho mínimo.
- **SC-003**: A busca responde em menos de 200 ms para 500 execuções.
- **SC-004**: O usuário abre qualquer execução com um clique e 100% dos links abrem a
  página correta.
- **SC-005**: Após Atualizar, tabela e horário refletem os dados novos em até 8
  segundos, sem chamadas duplicadas.
- **SC-006**: Nenhuma escrita é enviada e nenhum PAT é exposto.
- **SC-007**: A tela não apresenta violações críticas/sérias de acessibilidade e pode
  ser operada apenas por teclado.
- **SC-008**: A suíte das features 001–004 continua passando sem regressões.

## Assumptions

- Não há screenshot/export específico da tela Pipelines; a análise manual de
  `screens.md` é a fonte, reutilizando a estrutura das tabelas anteriores.
- São carregadas as execuções mais recentes do projeto, de todos os resultados,
  ordenadas por `finishTime` descendente; o time não altera o escopo.
- A descrição vem de `build/definitions`; uma chamada extra é feita e cacheada.
- Limite de 500 execuções; três linhas visíveis (cabeçalho + 3 linhas).
- O amarelo original `#FFCC00` não passa AA para ícone; usar tom escurecido e
  registrar em gaps.
- Links usam o navegador padrão e a allowlist existente.
- O app continua desktop-only, read-only, instância única, PT-BR e Windows 10/11 x64.
