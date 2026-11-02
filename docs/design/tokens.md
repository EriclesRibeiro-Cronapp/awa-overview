# Tokens

> Conteúdo entre marcadores `fe:auto` é gerado e sobrescrito. Escreva análises em **Análise** e notas livres em **Anotações**.

<!-- fe:auto:start:summary -->
**27** tokens derivados (0 de estilos, 0 de variáveis, 27 inferidos).
<!-- fe:auto:end:summary -->

<!-- fe:auto:start:table -->
| Token | Tipo | Valor | Origem | Usos |
| --- | --- | --- | --- | --- |
| color.inferido-7f91a4 | color | #7F91A4 | inferido | 81 |
| color.inferido-103053 | color | #103053 | inferido | 80 |
| color.inferido-7ea426 | color | #7EA426 | inferido | 24 |
| color.inferido-fbfbfb | color | #FBFBFB | inferido | 21 |
| color.inferido-9fccd9 | color | #9FCCD9 | inferido | 18 |
| color.inferido-103053-a10 | color | #1030531A | inferido | 16 |
| color.inferido-418bda | color | #418BDA | inferido | 11 |
| color.inferido-091624 | color | #091624 | inferido | 4 |
| color.inferido-df4444 | color | #DF4444 | inferido | 3 |
| color.inferido-8a38f5 | color | #8A38F5 | inferido | 2 |
| color.inferido-e5d13a | color | #E5D13A | inferido | 2 |
| color.inferido-ffffff | color | #FFFFFF | inferido | 1 |
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
| text.12 | font-size | 12px | inferido | 145 |
| text.16 | font-size | 16px | inferido | 9 |
| text.20 | font-size | 20px | inferido | 4 |
| font.inter | font-family | 'Inter', sans-serif | inferido | 158 |
| shadow.lg | shadow | 0px 4px 4px 0px #00000040 | inferido | 4 |
<!-- fe:auto:end:table -->

<!-- fe:auto:start:mapping -->
### CSS

```css
:root {
  --color-inferido-7f91a4: #7F91A4;
  --color-inferido-103053: #103053;
  --color-inferido-7ea426: #7EA426;
  --color-inferido-fbfbfb: #FBFBFB;
  --color-inferido-9fccd9: #9FCCD9;
  --color-inferido-103053-a10: #1030531A;
  --color-inferido-418bda: #418BDA;
  --color-inferido-091624: #091624;
  --color-inferido-df4444: #DF4444;
  --color-inferido-8a38f5: #8A38F5;
  --color-inferido-e5d13a: #E5D13A;
  --color-inferido-ffffff: #FFFFFF;
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
  --text-12: 12px;
  --text-16: 16px;
  --text-20: 20px;
  --font-inter: 'Inter', sans-serif;
  --shadow-lg: 0px 4px 4px 0px #00000040;
}
```

Arquivo completo: `tokens.css`.

### Tailwind

```js
// tailwind.config.js (theme.extend)
colors: {
  "inferido-7f91a4": "#7F91A4",
  "inferido-103053": "#103053",
  "inferido-7ea426": "#7EA426",
  "inferido-fbfbfb": "#FBFBFB",
  "inferido-9fccd9": "#9FCCD9",
  "inferido-103053-a10": "#1030531A",
  "inferido-418bda": "#418BDA",
  "inferido-091624": "#091624",
  "inferido-df4444": "#DF4444",
  "inferido-8a38f5": "#8A38F5",
  "inferido-e5d13a": "#E5D13A",
  "inferido-ffffff": "#FFFFFF"
}
```

Arquivo completo: `tailwind.config.js`.
<!-- fe:auto:end:mapping -->

## Análise

**Todos os 27 tokens são inferidos** — não há estilos nem variáveis acessíveis no arquivo. Trate os nomes como provisórios; o valor é confiável, o nome não.

### Cores

- `#103053` e `#1030531A` são o mesmo tom em 100% e 10%. O segundo é o divisor horizontal do cabeçalho (`Line 5`, stroke de 0,5px). Nomeie como `color.text-primary` e `color.border-subtle`.
- `#7F91A4` é o texto padrão das abas e dos ícones → `color.text-secondary`.
- `#FBFBFB` é a superfície dos boards e o texto das tags → separe em `color.surface` e `color.on-accent` (o mesmo valor com papéis diferentes).
- `#7EA426`, `#418BDA`, `#DF4444`, `#E5D13A` são, respectivamente, success, info, danger e warning.
- `#9FCCD9` só aparece em ícones → `color.icon-subtle`.
- `#8A38F5` é anotação do Figma (borda de componente set) e **não deve virar token**.

### Espaçamento

A escala útil é `4 / 8 / 12 / 16`. `space.10` existe porque as abas usam `gap: 10px` — decida entre oficializar o 10 ou corrigir para 8/12. `space.20` é margem de board; `space.28` tem 2 usos e pode ser exceção local. `space.741` **não foi tokenizado** (é espaçador de layout).

### Tipografia

`text.12` concentra 145 dos 158 textos. `text.16` e `text.20` são títulos. Como os tokens são por tamanho, o peso e o line-height precisam ser combinados no componente (ex.: `text.12` + `font-medium` + `leading-4`), ou o projeto adota tokens compostos (`text.body`, `text.title`).

### Sombra

`shadow.lg` é `0 4px 4px rgba(0,0,0,0.25)`. Por ser a única sombra e ter 4 usos, vale confirmar se é o popover "Aviso" antes de tratá-la como elevação padrão.

### Como usar

`tokens.css` e `tailwind.config.js` são pontos de partida gerados. Antes de commitar:
1. Renomeie os tokens inferidos para os papéis acima.
2. Remova `space.10`, `space.28`, `radius.5` e `radius.8` se forem exceções locais.
3. Confirme se a nomenclatura será `--color-*`/`--space-*` ou se o time usa outra convenção.

### Pendente de sincronização

A extração REST é anterior às telas novas. Ainda não estão em `tokens.css`: as 5 cores de hover (`#DA0000`, `#7AAE00`, `#386089`, `#D9C000`, `#0064CF`) e o amarelo de status dos pipelines (`#FFCC00`). Elas estão documentadas em `foundations.md` e entram automaticamente no próximo `fetch`.

## Anotações

_(livre — não é sobrescrito)_
