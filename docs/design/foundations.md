# Foundations

> Conteúdo entre marcadores `fe:auto` é gerado e sobrescrito. Escreva análises em **Análise** e notas livres em **Anotações**.

<!-- fe:auto:start:summary -->
**498** nós · **8** telas · **13** componentes · **158** textos · **66** instâncias · **0** interações.

Cobertura: **2 lacuna(s)** registradas em `README.md`.
<!-- fe:auto:end:summary -->

<!-- fe:auto:start:colors -->
| Hex | Opacidade | Estilo / Variável | Usos | Contexto | Exemplo |
| --- | --- | --- | --- | --- | --- |
| #7F91A4 | 100% | — | 81 | fill, text | Vector |
| #103053 | 100% | — | 80 | text, fill, stroke | Project products |
| #7EA426 | 100% | — | 24 | fill, stroke, text | Vector |
| #FBFBFB | 100% | — | 21 | fill, text | Board vazio |
| #9FCCD9 | 100% | — | 18 | fill | Vector |
| #103053 | 10% | — | 16 | stroke | Line 5 |
| #418BDA | 100% | — | 11 | text, fill | Em andamento |
| #091624 | 100% | — | 4 | text | AWA • Overview |
| #DF4444 | 100% | — | 3 | fill | Tag |
| #8A38F5 | 100% | — | 2 | stroke | Tab |
| #E5D13A | 100% | — | 2 | fill | Tag |
| #FFFFFF | 100% | — | 1 | fill | Componentes |
<!-- fe:auto:end:colors -->

<!-- fe:auto:start:typography -->
| Estilo | Família | Peso | Tamanho | Line-height | Letter-spacing | Case | Usos |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | Inter | 700 | 20px | 20px (100%) | 0 | — | 4 |
| — | Inter | 700 | 16px | 24px (150%) | 0 | — | 9 |
| — | Inter | 300 | 12px | 12px (100%) | 0 | — | 8 |
| — | Inter | 600 | 12px | 12px (100%) | 0 | — | 37 |
| — | Inter | 400 | 12px | 12px (100%) | 0 | — | 57 |
| — | Inter | 400 | 12px | 14px (116.7%) | 0 | — | 8 |
| — | Inter | 700 | 12px | 12px (100%) | 0 | — | 6 |
| — | Inter | 500 | 12px | 12px (100%) | 0 | — | 13 |
| — | Inter | 600 | 12px | 14px (116.7%) | 0 | — | 8 |
| — | Inter | 500 | 12px | 12px (100%) | 0 | — | 8 |
<!-- fe:auto:end:typography -->

<!-- fe:auto:start:spacing -->
| Valor | Usos | Origem |
| --- | --- | --- |
| 4px | 50 | gap, padding |
| 8px | 140 | gap, padding |
| 10px | 32 | gap, gap-manual |
| 12px | 54 | gap, padding |
| 16px | 9 | gap |
| 20px | 5 | gap-manual |
| 28px | 2 | gap |
| 741px | 4 | gap |

**Fora da grade de 4px:** 10px (32×).
<!-- fe:auto:end:spacing -->

<!-- fe:auto:start:radii -->
| Valor | Nós |
| --- | --- |
| 4px | 26 |
| 5px | 2 |
| 8px | 4 |
<!-- fe:auto:end:radii -->

<!-- fe:auto:start:shadows -->
| Tipo | x | y | Blur | Spread | Cor | Usos |
| --- | --- | --- | --- | --- | --- | --- |
| drop | 0px | 4px | 4px | 0px | #000000 25% | 4 |
<!-- fe:auto:end:shadows -->

<!-- fe:auto:start:grids -->
_Nenhum layout grid definido._
<!-- fe:auto:end:grids -->

<!-- fe:auto:start:breakpoints -->
| Largura | Alturas | Frames | Nome sugere breakpoint? |
| --- | --- | --- | --- |
| 417px | 282 | Componentes | não |
| 860px | 22 | Tabs, Tabs, Tabs | não |
| 900px | 700 | Board vazio, Board - Work items, Board preenchido, Board + | não |
<!-- fe:auto:end:breakpoints -->

## Análise

### Cores

Os papéis abaixo são **inferidos dos contextos de uso**, não de estilos (não há estilos publicados):

| Papel | Cor | Evidência |
|---|---|---|
| Texto primário / borda | `#103053` | 80 usos em texto, fill e stroke |
| Texto secundário / ícones | `#7F91A4` | 81 usos; é a cor do texto padrão das abas |
| Superfície | `#FBFBFB` | fundo dos boards e das tags |
| Destaque/positivo | `#7EA426` | aba selecionada e tag Success |
| Informativo | `#418BDA` | tag Info e status "Em andamento" |
| Perigo | `#DF4444` | tag Danger |
| Alerta | `#E5D13A` | tag Alert |
| Ícones claros | `#9FCCD9` | 18 usos, só fill |
| Marca | `#091624` | título "AWA • Overview" |

`#8A38F5` (2 usos) é a borda roxa dos conjuntos de componentes no canvas — **anotação do Figma, não faz parte do produto**. Não tokenizar.

### Nomenclatura adotada

Cores seguem `color.<grupo>-<papel>[-<estado>]`, com grupos `content`, `surface`,
`border`, `icon`, `brand` e os semânticos `success`, `info`, `danger`, `warning`.

| Token | Valor | Uso |
|---|---|---|
| `color.content-primary` | `#103053` | texto e bordas fortes |
| `color.content-secondary` | `#7F91A4` | texto e ícones secundários |
| `color.content-hover` | `#386089` | texto em hover |
| `color.surface` | `#FBFBFB` | fundo do board e das tags |
| `color.surface-raised` | `#FFFFFF` | superfície elevada (folha de componentes) |
| `color.border-subtle` | `#1030531A` | divisor e bordas de item |
| `color.icon-accent` | `#9FCCD9` | ícones de título |
| `color.brand` | `#091624` | marca "AWA" |
| `color.success` | `#7EA426` | sucesso e aba selecionada |
| `color.success-hover` | `#7AAE00` | hover de sucesso e aba |
| `color.success-icon` | `#FFCC00` | ícone de sucesso dos pipelines |
| `color.info` | `#418BDA` | informação e links |
| `color.info-hover` | `#0064CF` | hover de informação |
| `color.danger` | `#DF4444` | erro/perigo |
| `color.danger-hover` | `#DA0000` | hover de perigo |
| `color.warning` | `#E5D13A` | alerta |
| `color.warning-hover` | `#D9C000` | hover de alerta |

O `#8A38F5` (borda roxa dos conjuntos de componentes) é anotação do Figma e foi
**excluído** dos tokens de produto. Os nomes são aplicados automaticamente por
`docs/design/tokens.naming.json`; valores ainda ausentes do `tokens.css` entram no
próximo `fetch`.

### Cores de estado (confirmadas via MCP)

Os estados de hover introduziram uma variação mais escura para cada cor semântica:

| Papel | Default | Hover |
|---|---|---|
| Danger | `#DF4444` | `#DA0000` |
| Success | `#7EA426` | `#7AAE00` |
| Inactive | `#7F91A4` | `#386089` |
| Alert | `#E5D13A` | `#D9C000` |
| Info | `#418BDA` | `#0064CF` |

O `#386089` também é o texto do hover das abas. Essas 5 cores de hover **ainda não estão em `tokens.css`**; entram no próximo `fetch` REST. Sugestão de nomes: `color.danger-hover`, `color.success-hover`, `color.inactive-hover`, `color.alert-hover`, `color.info-hover`.

Status textual nas tabelas (sem fundo): "Aberto" em `#E5D13A`, "Concluído" em `#7EA426` e "Abandonado" em `#7F91A4`. Nos pipelines, o ícone de sucesso é **`#FFCC00`** — um amarelo novo, diferente do warning `#E5D13A` — e o de falha é `#DF4444`.

### Tipografia

Inter em todos os 158 textos. A base é **12px (145 usos)**, com 16px e 20px apenas para títulos.

- Existem **5 pesos a 12px** (300, 400, 500, 600, 700) — vale reduzir para 3 (regular, medium, semibold) antes de implementar.
- O mesmo 12px aparece com dois line-heights: **12px (100%)** e **14px (116,7%)**. Padronize um deles por contexto (linha única vs. parágrafo); 100% é apertado para textos de mais de uma linha.
- 12px como corpo é pequeno para leitura; confirme com o time se é intencional (UI densa) ou se o design será ajustado.

### Espaçamento e raios

A escala é de **4px** (4/8/12/16), com duas exceções:

- **10px** usado 32× — é o `gap` das abas (`Tab`) e aparece como espaçamento interno. Está fora da grade de 4; ou vira `space.10` oficial, ou é ajustado para 8/12.
- **20px** (5 usos) é a margem lateral dos boards em relação ao frame; **741px** é um espaçador de layout, não um token (por isso foi excluído de `tokens.css`).

Raios: **4px** é o padrão (26 nós, cards e tags). **5px** aparece só na borda dos conjuntos de componentes (anotação do Figma). **8px** é o raio dos quatro boards.

### Sombra

Há uma única sombra: `0 4px 4px rgba(0,0,0,0.25)`, usada 4× (provavelmente o popover "Aviso"). É forte para UI; avalie reduzir a opacidade para 8–12%.

### Grid e breakpoints

Não há `layoutGrid` definido. As larguras encontradas (900, 860, 417) são **tamanhos de canvas**, não breakpoints — não há evidência de responsividade. Se o layout precisar ser responsivo, isso é uma decisão nova, não uma extração do Figma.

## Anotações

_(livre — não é sobrescrito)_
