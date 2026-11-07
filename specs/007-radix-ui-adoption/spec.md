# Feature Specification: Adoção do Radix UI e Overview com 10 itens

**Feature Branch**: `007-radix-ui-adoption` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-06

**Status**: Draft

**Input**: User description: "Adotar Radix UI no AWA Overview preservando o design, com Dialog, Scroll Area, Select, Separator e Tabs; instalar Hover Card e Tooltip para uso futuro; e Overview com até 10 itens por categoria. Os 10 work items são os mais recentes atribuídos, ordenados por prioridade."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Migrar os controles sem alterar o visual (Priority: P1)

O usuário continua usando as mesmas telas, modais, abas, selects e separadores. Por
baixo, esses elementos passam a usar Radix Dialog, Select, Tabs e Separator, mantendo
exatamente o layout, as cores, a tipografia e o comportamento atuais.

**Why priority**: a migração só tem valor se não houver regressão visual ou funcional.

**Independent Test**: percorrer configuração, remoção, troca de abas, seleção de
projeto/time, filtros e tabelas; comparar com os snapshots atuais.

**Acceptance Scenarios**:

1. **Given** uma modal aberta, **When** o usuário usa Tab, Shift+Tab, ESC ou o botão
   fechar, **Then** o comportamento é o mesmo de hoje, com foco preso e restaurado.
2. **Given** os selects atuais, **When** o usuário abre e seleciona uma opção,
   **Then** valor, persistência e visual permanecem iguais.
3. **Given** as abas, **When** o usuário navega por clique ou teclado, **Then** aba
   ativa, indicador e tela exibida permanecem corretos.
4. **Given** a Overview, **When** os cards são exibidos, **Then** os separadores
   continuam com 1px e a cor atual.
5. **Given** um Select ou Dialog aberto, **When** o usuário interage com o footer ou
   titlebar, **Then** o portal fica na camada correta e não bloqueia os controles.

---

### User Story 2 - Overview com até 10 itens e rolagem (Priority: P2)

A Overview carrega até 10 itens de cada categoria e mantém os cards com o tamanho
atual. O conteúdo excedente fica em uma Radix Scroll Area, enquanto cabeçalho e
separador permanecem fixos.

**Why priority**: aumenta a densidade de informação sem mudar o design do board.

**Independent Test**: com 10 itens em cada categoria, rolar cada card e conferir que
cabeçalho e separador permanecem no lugar.

**Acceptance Scenarios**:

1. **Given** 10 work items, **When** o card é exibido, **Then** todos ficam acessíveis
   por rolagem dentro do card.
2. **Given** 10 pull requests, **When** o card é exibido, **Then** todos ficam
   acessíveis por rolagem.
3. **Given** 10 pipelines, **When** o card é exibido, **Then** todos ficam acessíveis
   por rolagem.
4. **Given** menos de 10 itens, **When** o card é exibido, **Then** nenhum espaço
   vazio artificial é criado.
5. **Given** a rolagem por teclado, **When** o card tem foco, **Then** o conteúdo rola
   sem mover a página.

---

### Deferred: Hover Card e Tooltip

As primitives Radix **Hover Card** e **Tooltip** serão instaladas nesta feature, mas
não terão integração visual ou consumidores ainda. A integração do Hover Card nos
ícones `spam-line` e qualquer tooltip serão tratados em features futuras. Nenhum texto,
trigger ou comportamento visual desses componentes faz parte deste escopo.

### Edge Cases

- Card com zero itens; nenhum espaço artificial.
- Card com 1–9 itens; Scroll Area sem espaços artificiais.
- Títulos longos, descrições longas e listas de 10 itens.
- Scroll Area dentro do card; foco e teclado.
- Portais Radix acima do titlebar, footer e overlay de modal.
- `-webkit-app-region: drag` no titlebar e `no-drag` nos controles/selects.
- Select dentro do footer/titlebar sem interferir no arraste.
- Modal de configuração aberta com Dialog e overlay.
- Navegação por teclado em Tabs, Select e Dialog.
- Foco após fechar Dialog.
- Layout fixo 900×700; nenhuma rolagem horizontal.
- Snapshots visuais existentes.
- Testes axe e RTL com portais.
- Falha de carregamento de uma categoria não deve quebrar as demais.
- PAT, cache e read-only permanecem inalterados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aplicação DEVE usar Radix **Dialog, Scroll Area, Select, Separator e
  Tabs**. Hover Card e Tooltip DEVEM ser instalados, mas NÃO DEVEM ter integração
  visual nesta feature. Não usar Tailwind, shadcn ou biblioteca visual completa.
- **FR-002**: O componente de modal atual DEVE ser substituído por Radix Dialog,
  preservando overlay `#1E1E1E` a 70%, tamanho, conteúdo, footer, foco, ESC e
  fechamento.
- **FR-003**: As modais de Configurações e de confirmação de remoção DEVEM usar o
  Dialog migrado.
- **FR-004**: Os corpos dos cards de Work items, Pipelines e Pull requests da Overview
  DEVEM usar Radix Scroll Area, mantendo tamanhos, cabeçalhos e separadores atuais.
- **FR-005**: A Overview DEVE carregar **até 10 itens** de cada categoria: work items,
  pull requests e pipelines.
- **FR-006**: Os work items DEVEM ser os **10 mais recentes atribuídos ao usuário**,
  selecionados por `System.ChangedDate` descendente e depois ordenados por
  `Microsoft.VSTS.Common.Priority` (1 primeiro); itens sem prioridade vão para o fim,
  com fallback `ChangedDate` descendente.
- **FR-007**: Pull requests "relacionados ao usuário" DEVEM considerar revisor ou
  autor, ordenados por criação mais recente.
- **FR-008**: Pipelines DEVEM ser os 10 mais recentes do projeto, ordenados por data
  de início descendente.
- **FR-009**: Todos os selects atuais DEVEM usar Radix Select: projeto, time, Tipo,
  Responsável, Status e Sprint de Work items, e Status de Pull requests.
- **FR-010**: Os selects DEVEM preservar opções, labels, placeholders, persistência,
  estados vazios e comportamento atuais.
- **FR-011**: Os divisores dos cards da Overview DEVEM usar Radix Separator, mantendo
  1px e `--color-border-subtle`.
- **FR-012**: A navegação atual DEVE usar Radix Tabs, preservando ordem, labels, aba
  ativa, indicador visual, teclado e telas.
- **FR-013**: Hover Card e Tooltip NÃO DEVEM ser renderizados nem criar triggers nesta
  feature; ficam apenas como dependências instaladas.
- **FR-014**: A migração NÃO DEVE alterar layout, espaçamento, tipografia, cores,
  ícones, titlebar, footer, janela fixa 900×700 ou conteúdo das telas.
- **FR-015**: Portais Radix DEVEM ficar acima do titlebar/footer/overlay quando
  necessário e respeitar `-webkit-app-region` (drag/no-drag).
- **FR-016**: A aplicação DEVE manter acessibilidade WCAG 2.2 AA: foco visível,
  teclado, rótulos, Escape, restauração de foco e leitura por leitor de tela.
- **FR-017**: Cache, staleness, refresh, erros, PAT e read-only NÃO DEVEM mudar de
  comportamento.
- **FR-018**: Tipos, IPC, cache e testes DEVEM ser atualizados para arrays de até 10
  itens por categoria.
- **FR-019**: Snapshots visuais DEVEM permanecer iguais; qualquer diferença inevitável
  DEVE ser justificada e registrada.
- **FR-020**: A migração DEVE ser incremental e coberta por testes unitários/RTL,
  contrato IPC, e2e e axe.

### Key Entities

- **Card da Overview**: cabeçalho fixo, Separator e corpo com Scroll Area.
- **Coleção da Overview**: até 10 work items, 10 PRs e 10 pipelines com contexto,
  cache, staleness e estados.
- **Primitive Radix**: Dialog, Scroll Area, Select, Separator e Tabs em uso; Hover Card
  e Tooltip apenas instalados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas e modais mantêm o visual atual; snapshots sem diferenças
  não justificadas.
- **SC-002**: 100% dos fluxos de Dialog, Select, Tabs, Separator e Scroll Area
  continuam funcionando por mouse e teclado.
- **SC-003**: Até 10 itens de cada categoria ficam acessíveis por rolagem nos cards.
- **SC-004**: Nenhuma regressão de acessibilidade crítica/séria na auditoria axe.
- **SC-005**: Nenhum Hover Card ou tooltip novo aparece na interface.
- **SC-006**: Nenhuma alteração de comportamento em cache, staleness, PAT ou read-only.
- **SC-007**: As suítes das features 001–006 continuam passando.

## Assumptions

- "Relacionados a você" para PRs significa revisor ou autor.
- Work items: selecionar os 10 mais recentes por `ChangedDate`, depois ordenar por
  prioridade; prioridade ausente usa `ChangedDate` como fallback.
- "Até 10" significa que menos itens são exibidos quando não há 10 disponíveis.
- Hover Card e Tooltip ficam instalados, mas sua integração será uma feature futura.
- O layout fixo 900×700, o titlebar customizado e o footer atual não mudam.
- Radix é usado sem Tailwind, shadcn, Lucide ou biblioteca visual completa.
