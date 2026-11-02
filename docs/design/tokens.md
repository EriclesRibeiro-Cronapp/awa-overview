# Tokens

> Conteúdo entre marcadores `fe:auto` é gerado e sobrescrito. Escreva análises em **Análise** e notas livres em **Anotações**.

<!-- fe:auto:start:summary -->
**29** tokens derivados (0 de estilos, 0 de variáveis, 26 inferidos).
<!-- fe:auto:end:summary -->

<!-- fe:auto:start:table -->
| Token | Tipo | Valor | Origem | Usos |
| --- | --- | --- | --- | --- |
| color.content-secondary | color | #7F91A4 | inferido | 81 |
| color.icon-muted | color | #7F91A4 | alias | 81 |
| color.content-primary | color | #103053 | inferido | 80 |
| color.success | color | #7EA426 | inferido | 24 |
| color.surface | color | #FBFBFB | inferido | 21 |
| color.on-accent | color | #FBFBFB | alias | 21 |
| color.icon-accent | color | #9FCCD9 | inferido | 18 |
| color.border-subtle | color | #1030531A | inferido | 16 |
| color.info | color | #418BDA | inferido | 11 |
| color.link | color | #418BDA | alias | 11 |
| color.brand | color | #091624 | inferido | 4 |
| color.danger | color | #DF4444 | inferido | 3 |
| color.warning | color | #E5D13A | inferido | 2 |
| color.surface-raised | color | #FFFFFF | inferido | 1 |
| space.4 | space | 4px | inferido | 50 |
| space.8 | space | 8px | inferido | 140 |
| space.10 | space | 10px | inferido | 32 |
| space.12 | space | 12px | inferido | 54 |
| space.16 | space | 16px | inferido | 9 |
| space.20 | space | 20px | inferido | 5 |
| space.28 | space | 28px | inferido | 2 |
| radius.4 | radius | 4px | inferido | 26 |
| radius.5 | radius | 5px | inferido | 2 |
| radius.8 | radius | 8px | inferido | 4 |
| font.size.12 | font-size | 12px | inferido | 145 |
| font.size.16 | font-size | 16px | inferido | 9 |
| font.size.20 | font-size | 20px | inferido | 4 |
| font.family.inter | font-family | 'Inter', sans-serif | inferido | 158 |
| shadow.overlay | shadow | 0px 4px 4px 0px #00000040 | inferido | 4 |
<!-- fe:auto:end:table -->

<!-- fe:auto:start:mapping -->
### CSS

```css
:root {
  --color-content-secondary: #7F91A4;
  --color-icon-muted: #7F91A4;
  --color-content-primary: #103053;
  --color-success: #7EA426;
  --color-surface: #FBFBFB;
  --color-on-accent: #FBFBFB;
  --color-icon-accent: #9FCCD9;
  --color-border-subtle: #1030531A;
  --color-info: #418BDA;
  --color-link: #418BDA;
  --color-brand: #091624;
  --color-danger: #DF4444;
  --color-warning: #E5D13A;
  --color-surface-raised: #FFFFFF;
  --space-4: 4px;
  --space-8: 8px;
  --space-10: 10px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-28: 28px;
  --radius-4: 4px;
  --radius-5: 5px;
  --radius-8: 8px;
  --font-size-12: 12px;
  --font-size-16: 16px;
  --font-size-20: 20px;
  --font-family-inter: 'Inter', sans-serif;
  --shadow-overlay: 0px 4px 4px 0px #00000040;
}
```

Arquivo completo: `tokens.css`.

### Tailwind

```js
// tailwind.config.js (theme.extend)
colors: {
  "content-secondary": "#7F91A4",
  "icon-muted": "#7F91A4",
  "content-primary": "#103053",
  "success": "#7EA426",
  "surface": "#FBFBFB",
  "on-accent": "#FBFBFB",
  "icon-accent": "#9FCCD9",
  "border-subtle": "#1030531A",
  "info": "#418BDA",
  "link": "#418BDA",
  "brand": "#091624",
  "danger": "#DF4444",
  "warning": "#E5D13A",
  "surface-raised": "#FFFFFF"
}
```

Arquivo completo: `tailwind.config.js`.
<!-- fe:auto:end:mapping -->

## Análise

**Os valores são inferidos** — não há estilos nem variáveis acessíveis no arquivo. A nomenclatura, porém, é fixa: `docs/design/tokens.naming.json` traduz os valores para os nomes adotados, e o `build` reaplica em `tokens.md`, `tokens.css` e `tailwind.config.js`.

### Convenção adotada

| Tipo | Padrão | Exemplos |
|---|---|---|
| Cor | `color.<grupo>-<papel>[-<estado>]` | `color.content-primary`, `color.success-hover` |
| Espaço | `space.<n>` | `space.8` |
| Raio | `radius.<n>` / `radius.pill` | `radius.4` |
| Família | `font.family.<família>` | `font.family.inter` |
| Tamanho | `font.size.<n>` | `font.size.12` |
| Sombra | `shadow.<papel>` | `shadow.overlay` |
| Componente | `<componente>.<variante>` | `tab.selected`, `tag.success-hover` |
| Card | `card.<tipo>` | `card.work-item` |
| Tabela | `table.<tipo>` | `table.pull-requests` |
| Modal | `modal.<tipo>` | `modal.configuration` |
| Ícone | `icon.<nome>` | `icon.settings-4-line` |
| Tela | `screen.<nome>` | `screen.work-items` |

Aliases semânticos são permitidos quando o mesmo valor tem papéis diferentes: `color.surface`/`color.on-accent`, `color.info`/`color.link` e `color.content-secondary`/`color.icon-muted`.

### Cores

- `#103053` → `color.content-primary`; `#1030531A` → `color.border-subtle` (divisor de 0,5px).
- `#7F91A4` → `color.content-secondary` e `color.icon-muted`.
- `#FBFBFB` → `color.surface` e `color.on-accent` (texto das tags).
- `#7EA426` → `color.success`; `#7AAE00` → `color.success-hover`; `#FFCC00` → `color.success-icon`.
- `#418BDA` → `color.info` e `color.link`; `#0064CF` → `color.info-hover`.
- `#DF4444` → `color.danger`; `#DA0000` → `color.danger-hover`.
- `#E5D13A` → `color.warning`; `#D9C000` → `color.warning-hover`.
- `#9FCCD9` → `color.icon-accent`; `#091624` → `color.brand`; `#FFFFFF` → `color.surface-raised`.
- `#8A38F5` é anotação do Figma (borda de componente set) e está **excluído**.

### Espaçamento

A escala útil é `4 / 8 / 12 / 16`. `space.10` existe porque as abas usam `gap: 10px` — decisão pendente: oficializar o 10 ou corrigir para 8/12. `space.20` é margem de board; `space.28` tem 2 usos. Espaçadores acima de 200px não são tokenizados.

### Tipografia

`font.size.12` concentra 145 dos 158 textos; `font.size.16` e `font.size.20` são títulos. Peso e line-height continuam sendo combinados no componente (ex.: `font.size.12` + `font-medium` + `leading-4`), ou podem virar tokens compostos (`font.body`, `font.title`) em uma próxima iteração.

### Sombra

`shadow.overlay` é `0 4px 4px rgba(0,0,0,0.25)`. Por ser a única sombra e ter 4 usos, confirme se é o popover "Aviso" antes de tratá-la como elevação padrão.

### Como usar

`tokens.css` e `tailwind.config.js` são gerados. Para mudar um nome:

1. Edite `tokens.naming.json` (mapa valor → nome).
2. Rode o `build`.
3. Não edite manualmente os blocos `fe:auto`.

Exceções ainda em aberto: `space.10`, `space.28`, `radius.5` (anotação do Figma) e `radius.8` (boards).

### Pendente de sincronização

A extração REST é anterior às telas novas. Os nomes já estão definidos, mas ainda não aparecem em `tokens.css`: `color.content-hover`, `color.success-hover`, `color.info-hover`, `color.danger-hover`, `color.warning-hover` e `color.success-icon`. Entram automaticamente no próximo `fetch`.

## Anotações

_(livre — não é sobrescrito)_
