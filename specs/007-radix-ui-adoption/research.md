# Research — Adoção do Radix UI

## Decisões

### 1. Radix sem shadcn/Tailwind

- **Decisão**: instalar apenas as primitives Radix necessárias e criar wrappers com as
  classes, tokens e ícones atuais.
- Pacotes: `@radix-ui/react-dialog`, `@radix-ui/react-hover-card`,
  `@radix-ui/react-scroll-area`, `@radix-ui/react-select`,
  `@radix-ui/react-separator`, `@radix-ui/react-tabs`,
  `@radix-ui/react-tooltip`.
- **Rationale**: shadcn exigiria Tailwind e traria um segundo sistema visual; a
  migração precisa preservar o design.
- **Alternativas**: React Aria (mais verboso), Headless UI (menos primitives) e
  bibliotecas visuais completas (MUI/Ant/Mantine) — rejeitadas por fidelidade.

### 2. Dialog

- Substituir a implementação interna de `Modal` por Radix Dialog, mantendo a API
  pública (`open`, `title`, `onClose`, `footer`, `children`).
- Usar `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title` e
  `Dialog.Close`; preservar overlay `rgba(30,30,30,0.7)`, largura 600, foco e ESC.
- Garantir que o overlay fique abaixo do titlebar e que o Dialog não bloqueie os
  controles da janela.
- **Rationale**: foco preso, restauração e leitor de tela são o principal ganho.

### 3. Hover Card — adiado

- **Decisão**: instalar `@radix-ui/react-hover-card`, mas não integrar nem renderizar
  Hover Card nesta feature.
- Nenhum trigger, texto, estilo ou teste visual de Hover Card faz parte do escopo.
- A integração nos ícones `spam-line` será uma feature futura, com decisão de design
  própria.
- **Rationale**: evita criar um componente visual sem referência completa no Figma e
  mantém o escopo desta feature focado na migração invisível e nos 10 itens.

### 4. Overview com até 10 itens

- **Work items**: selecionar os **10 mais recentes atribuídos** por
  `System.ChangedDate DESC` e depois ordenar esses 10 por
  `Microsoft.VSTS.Common.Priority` (1 primeiro); itens sem prioridade vão para o fim,
  com fallback `ChangedDate DESC`. Incluir o campo de prioridade na consulta.
- **Pull requests**: até 10 ativos relacionados ao usuário (revisor ou autor),
  ordenados por `creationDate DESC`.
- **Pipelines**: até 10 do projeto, ordenados por `startTime DESC`.
- **Rationale**: o texto editorial do board fala em “últimos 10”, mas a ordem visual
  deve respeitar prioridade.
- **Alternativas**: manter 3/1/1 e ajustar o texto (rejeitado pelo usuário).

### 5. Cache v2

- `OverviewSnapshot` passa para `schemaVersion: 2` com arrays `workItems`,
  `pullRequests`, `pipelines`.
- Snapshots v1 são ignorados e recriados; cache de projetos/times não muda.
- `OverviewView` muda de `pullRequest`/`pipeline` singulares para arrays; IPC e testes
  acompanham.
- **Rationale**: mudança de forma incompatível; ignorar cache antigo evita erro de
  renderização.

### 6. Scroll Area

- Usar `ScrollArea.Root/Viewport/Scrollbar/Thumb` no corpo dos três cards.
- Cabeçalho, ícone e Separator ficam fora da área rolável.
- Card Work items mantém 326×550; PR/Pipeline mantêm 526×271.
- Esconder a barra visual quando o design não a prevê, mantendo rolagem por wheel,
  trackpad e teclado; o viewport é focável quando necessário.
- **Rationale**: 10 itens sem alterar dimensões ou layout.

### 7. Select

- Substituir todos os selects atuais por Radix Select:
  - projeto e time do footer;
  - Tipo, Responsável, Status e Sprint de Work items;
  - Status de Pull requests.
- Radix não aceita item com valor vazio; usar sentinela `__all__` para “Todos” e
  mapear para `''` na API atual.
- Preservar labels, placeholders, opções derivadas, disabled/loading, persistência e
  classes visuais.
- Portais acima do footer/titlebar; `-webkit-app-region: no-drag` no trigger.
- **Rationale**: comportamento e acessibilidade sem alterar a aparência.

### 8. Separator

- Substituir os divisores dos cards da Overview por `Separator.Root` horizontal com
  `decorative` e classe atual; manter 1px `--color-border-subtle`.
- **Rationale**: componente semântico sem mudança visual.

### 9. Tabs

- Envolver a navegação em `Tabs.Root` com `value`/`onValueChange`.
- `Tabs.List` no shell, `Tabs.Trigger` para Overview/Work items/Pull requests/
  Pipelines e `Tabs.Content` ao redor da tela ativa.
- Preservar indicador ativo, labels, ordem e navegação por setas.
- **Rationale**: substituir a implementação manual mantendo o comportamento e o
  `aria-selected` correto.

### 10. Tooltip — instalado sem consumidor

- Instalar `@radix-ui/react-tooltip`, mas não criar wrapper, provider ou triggers nesta
  feature.
- Nenhum tooltip novo será inventado; o pacote fica disponível para uma feature futura.
- **Rationale**: atende ao pedido sem UI não mapeada e sem código morto.

### 11. Preservação visual e testes

- Nenhuma alteração de layout, cores, tipografia, espaçamento, ícones, titlebar,
  footer ou janela 900×700.
- Snapshots existentes são o gate; se houver diferença inevitável, justificar e
  atualizar apenas o snapshot afetado.
- Testes: wrappers Radix, fluxos de Dialog/Select/Tabs, scroll, dados de 10 itens, axe
  e e2e.
- Portais e foco requerem `z-index` acima do titlebar e `no-drag` nos controles.

## Riscos

| Risco | Mitigação |
|---|---|
| Radix alterar markup/estilo | Wrappers com classes atuais; snapshots |
| Portal abaixo de overlay/titlebar | z-index explícito; teste visual/e2e |
| Select dentro do titlebar/footer interferir no drag | `no-drag` no trigger |
| 10 itens alterarem cache antigo | schema v2; ignorar v1 |
| Prioridade ausente | fallback ChangedDate |
| PRs relacionados ultrapassarem limite | consultar top 100 e filtrar revisor/autor |
| Scrollbar visível no design | esconder visual; manter rolagem |
| Hover Card/Tooltip virarem escopo acidental | instalar apenas os pacotes; sem wrappers/triggers |
