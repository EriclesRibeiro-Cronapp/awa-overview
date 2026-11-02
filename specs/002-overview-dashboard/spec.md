# Feature Specification: Tela Overview — visão consolidada de trabalho

**Feature Branch**: `002-overview-dashboard` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Criar a tela Overview com os cards de Work items, Pull requests e Pipelines, usando o contexto de projeto/time selecionado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver meus work items no Overview (Priority: P1)

Com a organização configurada e um projeto/time selecionado, o usuário abre a
aplicação e vê a tela **Overview** com o cabeçalho, as abas e os três cards. O card
**Work items** lista os work items atribuídos ao usuário no contexto selecionado,
com tipo, ID, título, status, projeto, responsável e link para abrir no Azure
DevOps. Se não houver itens, o card mostra a mensagem vazia documentada.

**Why this priority**: é a primeira visão útil do produto e entrega valor sozinha:
o usuário passa a ver o que precisa fazer sem abrir o Azure DevOps.

**Independent Test**: com configuração e projeto/time válidos, abrir a aplicação e
verificar que o Overview é a tela inicial, que o card de work items lista até três
itens atribuídos ao usuário e que o link de cada item abre o Azure DevOps.

**Acceptance Scenarios**:

1. **Given** configuração válida e projeto/time selecionado, **When** a aplicação
   abre, **Then** a aba **Overview** está ativa e os três cards são exibidos.
2. **Given** work items atribuídos ao usuário no contexto, **When** o Overview
   carrega, **Then** o card **Work items** mostra até três itens, ordenados do mais
   recentemente alterado para o mais antigo, com tipo, ID, título, status, projeto,
   responsável e link.
3. **Given** nenhum work item atribuído ao usuário, **When** o Overview carrega,
   **Then** o card mostra "No work items are assigned to you in this view."
4. **Given** um item exibido, **When** o usuário aciona "Abrir no Azure DevOps",
   **Then** o navegador padrão abre a página do item, sem expor o PAT.
5. **Given** um projeto sem time selecionado, **When** o Overview carrega,
   **Then** os cards usam o escopo do projeto e o cabeçalho indica o time ausente.

---

### User Story 2 - Acompanhar pull requests e pipelines (Priority: P2)

No mesmo Overview, o usuário vê o pull request que precisa da sua atenção e a
execução de pipeline mais recente do projeto selecionado. Cada card permite abrir
o item diretamente no Azure DevOps.

**Why this priority**: completa a visão de trabalho diário e reduz a troca de
contexto entre work items, revisões e builds.

**Independent Test**: com um PR aguardando revisão e uma execução de pipeline
recente, abrir o Overview e verificar os dois cards, seus status e links.

**Acceptance Scenarios**:

1. **Given** um PR ativo aguardando a revisão/aprovação do usuário, **When** o
   Overview carrega, **Then** o card **Pull requests** mostra o PR mais recente com
   ID, título, data de criação, projeto, status e link.
2. **Given** nenhum PR aguardando o usuário, **When** o Overview carrega, **Then**
   o card mostra "No open pull requests need your attention."
3. **Given** execuções recentes no projeto, **When** o Overview carrega, **Then**
   o card **Pipelines** mostra a execução mais recente com status, nome, data de
   início, projeto e link.
4. **Given** nenhuma execução recente, **When** o Overview carrega, **Then** o card
   mostra "No recent pipeline runs were found for your projects."
5. **Given** um status de sucesso, falha ou andamento, **When** o card é exibido,
   **Then** o status é comunicado por texto e ícone, não apenas por cor.

---

### User Story 3 - Atualizar e reconhecer dados desatualizados (Priority: P3)

O usuário consulta o horário da última atualização no rodapé, aciona **Atualizar**
e vê os cards e o horário serem renovados. Se os dados vierem do cache e estiverem
vencidos, o app informa que estão desatualizados e mantém o conteúdo disponível.

**Why this priority**: evita decisões com dados velhos e dá controle sobre quando
consultar o Azure DevOps.

**Independent Test**: abrir o Overview, acionar "Atualizar" e verificar a mudança
do horário; simular cache vencido e verificar o aviso de dados desatualizados sem
tela em branco.

**Acceptance Scenarios**:

1. **Given** o Overview carregado, **When** o usuário aciona "Atualizar", **Then**
   os três cards e o rodapé são atualizados com os dados mais recentes.
2. **Given** dados em cache dentro da validade, **When** o Overview abre, **Then**
   o conteúdo é exibido imediatamente e a atualização em segundo plano não bloqueia
   a leitura.
3. **Given** dados em cache vencidos, **When** o Overview abre, **Then** o conteúdo
   antigo é exibido com indicação de desatualizado e uma nova consulta é feita.
4. **Given** falha em um dos cards, **When** o Overview carrega, **Then** os outros
   cards continuam visíveis e o card com falha oferece "Tentar novamente".
5. **Given** uma atualização em andamento, **When** o usuário aciona "Atualizar"
   novamente, **Then** a aplicação não dispara consultas duplicadas.

---

### Edge Cases

- Nenhum projeto disponível ou nenhum projeto selecionado.
- Projeto selecionado sem times; time removido entre carregamentos.
- Usuário sem work items atribuídos, sem PRs aguardando revisão ou sem pipelines.
- Item com título muito longo, campos ausentes, status desconhecido ou data inválida.
- Item removido ou movido no Azure DevOps depois da última atualização.
- PAT expirado ou revogado durante o carregamento (401).
- PAT sem permissão para work items, PRs ou pipelines (403).
- Organização/projeto inexistente (404), limite de requisições (429) ou falha do
  serviço (5xx).
- Modo offline ou timeout; cache local vencido, corrompido ou de versão anterior.
- Troca de projeto/time durante uma atualização em andamento.
- Falha ao abrir o link externo no navegador.
- Janela no tamanho mínimo de 900×700; títulos e cards não devem cortar conteúdo.
- Uso apenas por teclado; leitor de tela; contraste e foco visível.
- Segunda instância da aplicação em execução.
- Remoção da configuração enquanto o Overview está aberto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aplicação DEVE exibir, após a configuração, um shell de produto com
  cabeçalho ("AWA • Overview", seletor de projeto e seletor de time), divisor, abas
  (Overview, Work items, Pull requests, Pipelines), área de conteúdo e rodapé com o
  horário da última atualização.
- **FR-002**: A aba **Overview** DEVE ser a ativa por padrão. As demais abas DEVEM
  ser exibidas, mas permanecem indisponíveis nesta feature, com indicação acessível
  de que serão entregues em uma feature futura; nenhuma navegação para telas não
  implementadas DEVE ocorrer.
- **FR-003**: O Overview DEVE usar o projeto e o time selecionados como contexto.
  A troca de projeto ou time DEVE recarregar os três cards e manter a seleção
  persistida conforme a feature 001.
- **FR-004**: O card **Work items** DEVE listar até três work items atribuídos ao
  usuário autenticado, não concluídos, no projeto/time selecionado, ordenados por
  alteração mais recente. Cada item DEVE exibir tipo, ID, título, status, projeto,
  responsável e ação "Abrir no Azure DevOps".
- **FR-005**: O card **Pull requests** DEVE listar até um pull request ativo que
  precise da atenção do usuário (revisão/aprovação pendente) no projeto selecionado,
  ordenado por criação mais recente. Cada item DEVE exibir ID, título, data de
  criação, projeto, status e ação "Abrir no Azure DevOps".
- **FR-006**: O card **Pipelines** DEVE listar até uma execução de pipeline recente
  do projeto selecionado, ordenada por início mais recente. Cada item DEVE exibir
  status, nome, data de início, projeto e ação "Abrir no Azure DevOps".
- **FR-007**: Cada card DEVE ter estados independentes de carregamento, vazio, erro
  e conteúdo. O carregamento ou a falha de um card NÃO DEVE impedir a exibição dos
  demais.
- **FR-008**: Cada card DEVE exibir a mensagem vazia documentada, exatamente:
  "No work items are assigned to you in this view.",
  "No open pull requests need your attention." e
  "No recent pipeline runs were found for your projects."
- **FR-009**: Cada card DEVE oferecer "Tentar novamente" em caso de erro, sem
  apagar dados já exibidos de outros cards.
- **FR-010**: O rodapé DEVE exibir "Atualizado em DD/MM/AAAA às HH:MMh" no fuso
  local do usuário e um indicador quando os dados estiverem desatualizados.
- **FR-011**: O Overview DEVE oferecer uma ação "Atualizar" que consulta novamente
  os três cards, respeitando o contexto atual e evitando chamadas duplicadas
  concorrentes.
- **FR-012**: Os dados do Overview DEVEM ser armazenados em cache local cifrado,
  com validade de 5 minutos, associados à organização, ao projeto e ao time. Dados
  vencidos PODEM ser exibidos com indicação de desatualizado enquanto a atualização
  ocorre.
- **FR-013**: O cache DEVE ser invalidado na troca de organização, remoção da
  configuração ou alteração de esquema incompatível, conforme a feature 001.
- **FR-014**: As ações "Abrir no Azure DevOps" DEVEM abrir a URL web do item no
  navegador padrão, sem credenciais, sem PAT e sem parâmetros sensíveis.
- **FR-015**: A aplicação NÃO DEVE executar operações de escrita no Azure DevOps
  nesta feature; todas as consultas DEVEM ser somente leitura.
- **FR-016**: O PAT NÃO DEVE ser exibido, devolvido à interface, gravado em logs,
  incluído em URLs ou exposto em diagnóstico.
- **FR-017**: A tela DEVE seguir a interface documentada em `docs/design/` para
  layout, tipografia, cores, espaçamentos, ícones, cards e textos, usando os
  componentes e tokens existentes. Correções de contraste ou de acessibilidade
  PODEM ser aplicadas e DEVEM ser registradas como desvio visual.
- **FR-018**: A tela DEVE atender aos critérios de acessibilidade AA aplicáveis:
  abas com semântica e navegação por teclado, foco visível, rótulos acessíveis,
  status comunicado por texto/ícone e contraste mínimo.
- **FR-019**: Datas DEVEM ser exibidas no formato local `DD/MM/AAAA HH:MM` e nomes
  ausentes DEVEM ter fallback textual, sem quebrar o layout.
- **FR-020**: Quando não houver projeto ou time selecionado, os cards DEVEM exibir
  orientação para selecionar o contexto, sem disparar consultas sem escopo.
- **FR-021**: O Overview DEVE continuar funcional quando um card falhar, quando a
  rede estiver indisponível e quando o cache estiver corrompido, apresentando
  mensagens claras e ação de recuperação.
- **FR-022**: A ação de atualização e o carregamento automático DEVEM ser
  interrompidos ou descartados com segurança quando o contexto mudar, evitando
  exibir dados de outro projeto/time.
- **FR-023**: O shell e os cards DEVEM ser utilizáveis na janela mínima de 900×700,
  sem sobreposição, corte de conteúdo ou rolagem horizontal.

### Key Entities *(include if feature involves data)*

- **Contexto do Overview**: organização, projeto e time selecionados; determina o
  escopo de todas as consultas e do cache.
- **Resumo de Work item**: ID, tipo, título, status, projeto, responsável, data da
  última alteração e URL de acesso.
- **Resumo de Pull request**: ID, título, status, projeto, data de criação,
  pendência de revisão/aprovação e URL de acesso.
- **Resumo de Pipeline**: ID, nome, status/resultado, projeto, data de início e URL
  de acesso.
- **Snapshot do Overview**: conjunto dos três resumos, contexto, instante da coleta,
  validade e indicador de desatualizado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com configuração e contexto válidos, o Overview exibe conteúdo em
  menos de 2 segundos quando há cache válido e em menos de 5 segundos quando precisa
  consultar o Azure DevOps, em 95% das aberturas.
- **SC-002**: 100% dos cards exibem uma mensagem compreensível quando não há dados,
  nunca uma área vazia sem explicação.
- **SC-003**: O usuário consegue abrir qualquer item exibido no Azure DevOps com um
  único clique, e 100% dos links gerados abrem a página correta.
- **SC-004**: Após "Atualizar", os três cards e o horário do rodapé refletem os
  dados mais recentes em até 5 segundos, sem chamadas duplicadas concorrentes.
- **SC-005**: Nenhuma operação de escrita é enviada ao Azure DevOps e nenhum PAT é
  exposto na interface, logs, URLs ou diagnóstico.
- **SC-006**: A tela não apresenta violações críticas ou sérias de acessibilidade
  na auditoria automatizada e pode ser operada apenas por teclado.
- **SC-007**: Pelo menos 90% dos usuários de teste identificam seus work items,
  PR pendente e última execução de pipeline sem treinamento prévio.
- **SC-008**: A falha de um card não impede a leitura dos outros dois em 100% dos
  cenários de erro simulados.
- **SC-009**: A suíte da feature 001 continua passando sem regressões.

## Assumptions

- A feature 001 fornece configuração válida, seleção de projeto/time persistida,
  cache cifrado e cofre de credenciais; esta feature reutiliza esses recursos.
- O Overview usa o projeto e o time selecionados; agregação entre todos os projetos
  da organização fica fora do escopo desta feature.
- "Work items atribuídos ao usuário" significa itens em que o usuário autenticado é
  o responsável atual e cujo estado não é concluído.
- "Pull request precisa de atenção" significa PR ativo em que o usuário é revisor
  e ainda não aprovou; o mais recente é exibido.
- "Pipeline recente" significa a execução mais recente do projeto, independente do
  resultado (sucesso, falha, andamento ou cancelado).
- Os limites de itens (três work items, um PR e um pipeline) seguem o espaço e o
  conteúdo documentados no Figma; ampliar esses limites exige nova decisão de design.
- As abas Work items, Pull requests e Pipelines serão entregues em features
  seguintes; nesta feature ficam visíveis e indisponíveis.
- A validade do cache é de 5 minutos, alinhada ao comportamento de staleness já
  existente; o usuário pode forçar atualização a qualquer momento.
- O app continua desktop-only, read-only, instância única e sem autenticação
  própria; Windows 10/11 x64 é a plataforma alvo.
- Links externos usam o navegador padrão do sistema; não há navegação embutida.
- Não há atualização em tempo real nem push do Azure DevOps; a atualização é por
  abertura, cache, foco ou ação manual.
