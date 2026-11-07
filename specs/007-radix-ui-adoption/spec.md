# Feature Specification: Adoção do Radix UI e Overview com 10 itens

**Feature Branch**: `007-radix-ui-adoption` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Adotar Radix UI no AWA Overview preservando o design, com Dialog, Hover Card, Scroll Area, Select, Separator, Tabs e Tooltip, e Overview com até 10 itens por categoria. O texto do Hover Card é fixo em 10 itens, independentemente da quantidade disponível."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Substituir primitives sem alterar o visual (Priority: P1)

O usuário continua usando as mesmas telas, modais, abas, selects e separadores. Por
baixo, esses elementos passam a usar as primitives Radix UI, mantendo exatamente o
layout, as cores, a tipografia e o comportamento atuais.

**Why priority**: a migração só tem valor se não houver regressão visual ou funcional.

**Independent Test**: percorrer configuração, remoção de configuração, troca de
abas, seleção de projeto/time, filtros e tabelas; comparar com os snapshots atuais.

**Acceptance Scenarios**:

1. **Given** uma modal aberta, **When** o usuário usa Tab, Shift+Tab, ESC ou o botão
   fechar, **Then** o comportamento é o mesmo de hoje, com foco preso e restaurado.
2. **Given** os selects atuais, **When** o usuário abre e seleciona uma opção,
   **Then** o valor, a persistência e o visual permanecem iguais.
3. **Given** as abas, **When** o usuário navega por clique ou teclado, **Then** a aba
   ativa, o indicador visual e a tela exibida permanecem corretos.
4. **Given** a Overview, **When** os cards são exibidos, **Then** os separadores
   continuam com 1px e a cor atual.

---

### User Story 2 - Hover Card nos ícones de informação (Priority: P2)

Ao passar o mouse ou focar o ícone `spam-line` de cada card da Overview, o usuário vê
um Hover Card com o texto explicativo fixo daquele card.

**Why priority**: adiciona contexto sem poluir o board e mantém a informação
acessível por teclado.

**Independent Test**: hover e foco nos três ícones de informação; conferir os textos
exatos e o fechamento ao sair/ESC.

**Acceptance Scenarios**:

1. **Given** o card Work items, **When** o ícone de informação recebe hover ou foco,
   **Then** o Hover Card mostra "Últimos 10 work items associados a você por
   prioridade".
2. **Given** o card Pipelines, **When** o ícone recebe hover ou foco, **Then** o texto
   é "Últimos 10 pipelines ordenado por data de inicialização.".
3. **Given** o card Pull requests, **When** o ícone recebe hover ou foco, **Then** o
   texto é "Últimos 10 pull requests relacionados a você.".
4. **Given** qualquer quantidade de itens no card — inclusive zero ou menos de 10 —
   **When** o Hover Card abre, **Then** o texto permanece fixo em "10".
5. **Given** o Hover Card aberto, **When** o usuário pressiona ESC ou sai do
   trigger, **Then** ele fecha sem alterar o card.

---

### User Story 3 - Overview com até 10 itens e rolagem (Priority: P3)

A Overview carrega até 10 itens de cada categoria e mantém os cards com o tamanho
atual. O conteúdo excedente fica em uma Scroll Area, enquanto cabeçalho e separador
permanecem fixos.

**Why priority**: aumenta a densidade de informação sem mudar o design do board.

**Independent Test**: com mais itens que o espaço visível, rolar cada card e conferir
que cabeçalho e separador permanecem no lugar.

**Acceptance Scenarios**:

1. **Given** 10 work items, **When** o card é exibido, **Then** todos ficam acessíveis
   por rolagem dentro do card.
2. **Given** 10 pull requests, **When** o card é exibido, **Then** todos ficam
   acessíveis por rolagem.
3. **Given** 10 pipelines, **When** o card é exibido, **Then** todos ficam acessíveis
   por rolagem.
4. **Given** menos de 10 itens, **When** o card é exibido, **Then** nenhum espaço
   vazio artificial é criado e o Hover Card continua dizendo "10".
5. **Given** a rolagem por teclado, **When** o card tem foco, **Then** o conteúdo rola
   sem mover a página.

---

### User Story 4 - Tooltip disponível sem uso visual (Priority: P4)

A primitive Tooltip é instalada e preparada para uso futuro, mas nenhum tooltip novo
é exibido enquanto não houver um local mapeado.

**Why priority**: evita criar tooltips sem decisão de design.

**Independent Test**: revisar a aplicação e confirmar que nenhum tooltip novo aparece.

**Acceptance Scenarios**:

1. **Given** a aplicação em uso, **When** o usuário navega pelas telas,
   **Then** nenhum tooltip novo é exibido.
2. **Given** a primitive instalada, **When** um local futuro for mapeado,
   **Then** ela pode ser usada sem nova dependência.

---

### Edge Cases

- Card com zero itens; Hover Card continua com o texto fixo em 10.
- Card com 1–9 itens; Scroll Area sem espaços artificiais; texto fixo em 10.
- Títulos longos, descrições longas e listas de 10 itens.
- Hover Card aberto ao trocar de aba, projeto ou time.
- Hover Card dentro do card com Scroll Area.
- Portais Radix acima do titlebar, do footer e do overlay de modal.
- `-webkit-app-region: drag` no titlebar e `no-drag` nos controles/selects.
- Select dentro do footer e do titlebar sem interferir no arraste.
- Modal de configuração aberta com Dialog e overlay.
- Navegação por teclado em Tabs, Select, Dialog e Hover Card.
- Foco após fechar Dialog/Hover Card.
- Layout fixo 900×700; nenhuma rolagem horizontal.
- Snapshots visuais existentes.
- Testes axe e RTL com portais.
- Falha de carregamento de uma categoria não deve quebrar as demais.
- PAT, cache e read-only permanecem inalterados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aplicação DEVE usar apenas as primitives Radix **Dialog, Hover Card,
  Scroll Area, Select, Separator, Tabs e Tooltip**; NÃO DEVE introduzir Tailwind,
  shadcn ou uma biblioteca visual completa.
- **FR-002**: O componente de modal atual DEVE ser substituído por Radix Dialog,
  preservando overlay `#1E1E1E` a 70%, tamanho, conteúdo, footer, foco, ESC e
  fechamento.
- **FR-003**: As modais de Configurações e de confirmação de remoção DEVEM usar o
  Dialog migrado.
- **FR-004**: O ícone `spam-line` de cada card da Overview DEVE ser o trigger de um
  Radix Hover Card, acessível por hover e foco.
- **FR-005**: Os textos do Hover Card DEVEM ser exatamente:
  - Work items: "Últimos 10 work items associados a você por prioridade"
  - Pipelines: "Últimos 10 pipelines ordenado por data de inicialização."
  - Pull requests: "Últimos 10 pull requests relacionados a você."
- **FR-006**: O texto do Hover Card DEVE permanecer fixo em "10",
  independentemente de haver 0, 1, 9 ou 10 itens disponíveis.
- **FR-007**: O Hover Card NÃO DEVE listar os itens; ele exibe apenas o texto
  explicativo fixo.
- **FR-008**: O Hover Card DEVE reutilizar o estilo do popover `Aviso` e os tokens
  atuais, sem criar uma nova linguagem visual.
- **FR-009**: Os corpos dos cards de Work items, Pipelines e Pull requests da Overview
  DEVEM usar Radix Scroll Area, mantendo os tamanhos, cabeçalhos e separadores atuais.
- **FR-010**: A Overview DEVE carregar **até 10 itens** de cada categoria:
  work items atribuídos ao usuário, pull requests relacionados ao usuário e pipelines
  do projeto.
- **FR-011**: Work items DEVEM ser ordenados por prioridade (campo do Azure DevOps),
  com fallback para alteração mais recente.
- **FR-012**: Pull requests "relacionados ao usuário" DEVEM considerar revisor ou
  autor, conforme premissa desta spec.
- **FR-013**: Pipelines DEVEM ser ordenados por data de início, do mais recente para
  o mais antigo.
- **FR-014**: Todos os selects atuais DEVEM usar Radix Select: projeto, time, Tipo,
  Responsável, Status e Sprint de Work items, e Status de Pull requests.
- **FR-015**: Os selects DEVEM preservar opções, labels, placeholders, persistência,
  estados vazios e comportamento atuais.
- **FR-016**: Os divisores dos cards da Overview DEVEM usar Radix Separator, mantendo
  1px e `--color-border-subtle`.
- **FR-017**: A navegação atual DEVE usar Radix Tabs, preservando ordem, labels,
  aba ativa, indicador visual, teclado e telas.
- **FR-018**: Radix Tooltip DEVE ser instalado, mas NÃO DEVE ser usado visualmente
  nesta feature; nenhum tooltip novo pode ser inventado.
- **FR-019**: A migração NÃO DEVE alterar layout, espaçamento, tipografia, cores,
  ícones, titlebar, footer, janela fixa 900×700 ou conteúdo das telas.
- **FR-020**: Portais Radix DEVEM ficar acima do titlebar/footer/overlay quando
  necessário e respeitar `-webkit-app-region` (drag/no-drag).
- **FR-021**: A aplicação DEVE manter acessibilidade WCAG 2.2 AA: foco visível,
  teclado, rótulos, Escape, restauração de foco e leitura por leitor de tela.
- **FR-022**: Cache, staleness, refresh, erros, PAT e read-only NÃO DEVEM mudar de
  comportamento.
- **FR-023**: Tipos, IPC, cache e testes DEVEM ser atualizados para os arrays de até
  10 itens por categoria.
- **FR-024**: Snapshots visuais DEVEM permanecer iguais; qualquer diferença inevitável
  DEVE ser justificada e registrada.
- **FR-025**: A migração DEVE ser incremental e coberta por testes unitários/RTL,
  contrato IPC, e2e e axe.

### Key Entities

- **Card da Overview**: cabeçalho fixo, ícone de informação com Hover Card, Separator
  e corpo com Scroll Area.
- **Conteúdo do Hover Card**: texto fixo por categoria, independente da quantidade.
- **Coleção da Overview**: até 10 work items, 10 PRs e 10 pipelines com contexto,
  cache, staleness e estados.
- **Primitive Radix**: Dialog, Hover Card, Scroll Area, Select, Separator, Tabs,
  Tooltip.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas e modais mantêm o visual atual; snapshots sem diferenças
  não justificadas.
- **SC-002**: 100% dos fluxos de Dialog, Select, Tabs, Separator e Scroll Area
  continuam funcionando por mouse e teclado.
- **SC-003**: Os três Hover Cards exibem o texto fixo com "10" em 100% dos casos,
  inclusive com zero itens.
- **SC-004**: Até 10 itens de cada categoria ficam acessíveis por rolagem nos cards.
- **SC-005**: Nenhuma regressão de acessibilidade crítica/séria na auditoria axe.
- **SC-006**: Nenhum tooltip novo aparece na interface.
- **SC-007**: Nenhuma alteração de comportamento em cache, staleness, PAT ou
  read-only.
- **SC-008**: As suítes das features 001–006 continuam passando.

## Assumptions

- "Pull requests relacionados a você" significa PRs em que o usuário é revisor ou
  autor.
- "Prioridade" usa o campo de prioridade do Azure DevOps; itens sem prioridade usam
  a data de alteração como fallback.
- A Overview carrega **até** 10 itens; se houver menos, o Hover Card continua exibindo
  o texto fixo em "10".
- O Hover Card é apenas textual e não lista os itens.
- O estilo do Hover Card segue o popover `Aviso` existente.
- Radix Tooltip fica instalado, mas sem uso até um local ser mapeado.
- Não haverá Tailwind, shadcn ou troca dos ícones atuais.
- A janela permanece fixa em 900×700, sem frame nativo, com o titlebar customizado.
- A migração é incremental e não altera os contratos de segurança, PAT ou read-only.
