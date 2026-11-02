# Feature Specification: Header customizado e controles da janela

**Feature Branch**: `006-custom-window-header` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Criar header customizado sem frame nativo do Windows, com logo AWA, botões de minimizar/fechar, header arrastável e seletores de projeto/time no footer, em janela de 900px."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mover e controlar a janela sem o header nativo (Priority: P1)

Ao abrir o aplicativo, o usuário vê uma janela sem a barra de título padrão do Windows.
O header do produto contém a logo, o acesso às configurações e os botões de minimizar e
fechar. O usuário arrasta a janela pelo header e usa os controles normalmente.

**Why priority**: sem o frame nativo, a janela precisa continuar totalmente operável;
arrastar, minimizar e fechar são funções básicas do desktop.

**Independent Test**: abrir o app, arrastar pela área livre do header, minimizar e
fechar; verificar que a janela responde e que nenhuma barra nativa aparece.

**Acceptance Scenarios**:

1. **Given** o app aberto, **When** a janela é exibida, **Then** não há barra de título,
   borda ou botões nativos do Windows.
2. **Given** o header visível, **When** o usuário arrasta uma área livre do header,
   **Then** a janela se move.
3. **Given** o header visível, **When** o usuário clica em minimizar,
   **Then** a janela é minimizada para a barra de tarefas.
4. **Given** o header visível, **When** o usuário clica em fechar,
   **Then** a aplicação encerra como no fechamento normal.
5. **Given** foco no botão minimizar ou fechar, **When** o usuário usa Enter/Espaço,
   **Then** a ação correspondente é executada.

---

### User Story 2 - Identidade visual no header (Priority: P2)

O header passa a exibir a logo oficial AWA Overview no lugar do texto "AWA • Overview".
O acesso às configurações permanece disponível, e os seletores de projeto/time saem
do header.

**Why priority**: identidade visual e organização do espaço; o header fica reservado
para marca, configurações e controles da janela.

**Independent Test**: abrir o app e conferir a logo em 95×12px, o ícone de
configurações, minimizar e fechar; confirmar que não há seletores no header.

**Acceptance Scenarios**:

1. **Given** o header renderizado, **When** a tela carrega, **Then** a logo PNG
   `awa-logo.png` é exibida em 95×12px com texto alternativo "AWA Overview".
2. **Given** o header, **When** o usuário aciona o ícone de configurações,
   **Then** a modal de configuração abre como hoje.
3. **Given** o header, **When** ele é exibido, **Then** não há seletor de projeto nem
   de time nele.
4. **Given** o logo carregado, **When** a janela é redimensionada ou o app reabre,
   **Then** a logo não distorce e mantém a proporção.

---

### User Story 3 - Contexto no footer e largura total (Priority: P3)

Os seletores de projeto e time (chamado de sprint no pedido) ficam no footer, à
direita. À esquerda ficam o ícone de atualização, o horário "Atualizado em..." e o
indicador de dados desatualizados. A janela tem 900px de largura e o conteúdo ocupa
toda a área disponível, sem faixa vazia à direita.

**Why priority**: mantém o contexto acessível em todas as telas e elimina o espaço
vazio causado pela largura anterior.

**Independent Test**: abrir o app em 900×700, conferir os seletores no footer e
verificar que o conteúdo vai até a margem direita de 20px.

**Acceptance Scenarios**:

1. **Given** o app aberto, **When** a janela é exibida, **Then** a largura é 900px e
   o conteúdo ocupa a área entre as margens de 20px.
2. **Given** o footer, **When** ele é exibido, **Then** há um grupo à esquerda com
   refresh + atualização e um grupo à direita com projeto + time, claramente separados.
3. **Given** o seletor de projeto, **When** o usuário troca o projeto,
   **Then** as telas continuam reagindo como hoje e o time é recarregado.
4. **Given** uma tela sem projeto selecionado, **When** o footer é exibido,
   **Then** os seletores permanecem disponíveis para configurar o contexto.
5. **Given** a janela em 900px, **When** qualquer tela é aberta, **Then** não há
   rolagem horizontal nem faixa vazia à direita.

---

### Edge Cases

- Arrastar sobre a logo, textos ou espaços vazios do header sem mover ao clicar em
  controles interativos.
- Clique acidental em minimizar/fechar; foco e teclado.
- Fechar com modal de configuração aberta (comportamento atual de fechamento).
- Janela minimizada e restaurada pela barra de tarefas.
- ESC ou atalhos do sistema não devem acionar fechar.
- Windows com escala de DPI diferente de 100%; logo mantém 95×12 CSS px.
- Tema escuro do Windows não altera as cores do header.
- Header em telas com conteúdo longo; não deve criar overflow.
- Ausência da logo ou falha ao carregar asset; fallback textual acessível.
- App em instância única; segunda execução foca a janela existente.
- Configuração removida com o footer visível.
- Navegação por teclado sem armadilha de foco nos controles da janela.

## Requirements *(mandatory)*

### Functional Rules

- **FR-001**: A janela principal DEVE ser criada sem frame nativo no Windows
  (`frame: false`), removendo barra de título, borda e controles nativos.
- **FR-002**: A janela DEVE abrir em **900×700px** nesta feature, com o conteúdo
  ocupando as margens de 20px (860px úteis), sem faixa vazia à direita.
- **FR-003**: O header DEVE exibir a logo oficial `awa-logo.png` em **95×12px**, com
  texto alternativo "AWA Overview"; a logo NÃO DEVE ser distorcida.
- **FR-004**: O header DEVE manter o acesso às configurações e exibir, à direita, os
  controles **minimizar** (`subtract-line`) e **fechar** (`close-line`), sem botão de
  maximizar.
- **FR-005**: O header inteiro DEVE ser uma região de arraste da janela, exceto os
  controles interativos (configurações, minimizar, fechar), que DEVEM ficar em
  `no-drag` e continuar clicáveis.
- **FR-006**: Minimizar DEVE acionar a minimização nativa da janela; fechar DEVE
  encerrar a aplicação com o mesmo comportamento do fechamento atual.
- **FR-007**: Os controles DEVEM ter rótulos acessíveis ("Minimizar", "Fechar",
  "Configurações"), foco visível e operação por teclado.
- **FR-008**: Os seletores de projeto e time NÃO DEVEM mais aparecer no header.
- **FR-009**: O footer DEVE ter dois grupos separados: à esquerda, ícone de refresh,
  "Atualizado em ..." e indicador de dados desatualizados/erro; à direita, seleção de
  projeto e seleção de time.
- **FR-010**: Os seletores do footer DEVEM reutilizar o comportamento atual de
  `ProjectSelector`/`TeamSelector` (carregamento, seleção persistida, estado vazio e
  erros).
- **FR-011**: As abas e todas as telas existentes DEVEM continuar funcionando e
  ocupando a largura útil de 900px.
- **FR-012**: O logo e os ícones DEVEM ser assets locais; nenhuma imagem remota.
- **FR-013**: O header NÃO DEVE interceptar cliques dos controles, nem impedir a
  navegação por teclado.
- **FR-014**: A aplicação DEVE continuar desktop-only, read-only, instância única,
  PT-BR e Windows 10/11 x64.
- **FR-015**: A mudança NÃO DEVE alterar os contratos de dados, cache, PAT ou
  permissões existentes.

### Window Control Contract

- O preload DEVE expor apenas operações de janela necessárias:
  `minimize()` e `close()`.
- O main DEVE validar que a chamada vem da janela principal; nenhum caminho
  arbitrário de janela/arquivo/execução pode ser exposto.
- O fechamento DEVE seguir o fluxo normal de `window-all-closed`/`before-quit`.

### Key Entities

- **Header da janela**: logo, configurações, minimizar, fechar e região de arraste.
- **Footer de contexto**: atualização/staleness à esquerda; projeto/time à direita.
- **Janela principal**: 900×700, sem frame nativo, arrastável, instância única.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das aberturas exibem a janela sem barra de título nativa do
  Windows.
- **SC-002**: O usuário consegue mover a janela arrastando qualquer área livre do
  header em 100% das tentativas.
- **SC-003**: Minimizar e fechar funcionam por mouse e teclado em 100% dos testes.
- **SC-004**: A logo é exibida em 95×12px, sem distorção, e o header não contém
  seletores de projeto/time.
- **SC-005**: Em 900px, nenhuma tela apresenta faixa vazia à direita ou rolagem
  horizontal.
- **SC-006**: Os seletores do footer mantêm o comportamento e a persistência atuais.
- **SC-007**: A tela não apresenta violações críticas/sérias de acessibilidade.
- **SC-008**: As suítes das features 001–005 continuam passando sem regressões.

## Assumptions

- O segundo seletor do footer é o **Time (equipe)** já existente, chamado de "sprint"
  no pedido; se o usuário quiser um seletor real de Sprint/Iteration, isso será uma
  feature separada (nova consulta e novo filtro).
- A janela fica fixa em 900×700 nesta feature, sem maximizar nem redimensionar; isso
  garante o layout documentado e a ausência de faixa vazia. Redimensionamento pode ser
  uma feature futura.
- O botão de configurações permanece no header, conforme o design.
- As abas existentes permanecem abaixo do header; esta feature não as remove.
- O logo está em `docs/design/assets/exports/awa-logo.png` (95×12) e será copiado
  para os assets do renderer.
- Os ícones `subtract-line` e `close-line` já existem em
  `docs/design/assets/icons` e no renderer.
- O comportamento de arraste usa a região nativa do Electron; não há captura manual
  de mouse.
- A primeira plataforma é Windows 10/11 x64; macOS/Linux exigem tratamento próprio.
