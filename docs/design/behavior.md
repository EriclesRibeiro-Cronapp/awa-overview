# Comportamento

> Conteúdo entre marcadores `fe:auto` é gerado e sobrescrito. Escreva análises em **Análise** e notas livres em **Anotações**.

<!-- fe:auto:start:summary -->
**0** interação(ões) · **3** largura(s) distinta(s).
<!-- fe:auto:end:summary -->

<!-- fe:auto:start:interactions -->
_Nenhuma interação de protótipo registrada._
<!-- fe:auto:end:interactions -->

<!-- fe:auto:start:responsive -->
| Largura | Alturas | Frames |
| --- | --- | --- |
| 417px | 282 | Componentes |
| 860px | 22 | Tabs, Tabs, Tabs |
| 900px | 700 | Board vazio, Board - Work items, Board preenchido, Board + |
<!-- fe:auto:end:responsive -->

<!-- fe:auto:start:a11y -->
| Cor de texto | Estilo | Contraste s/ branco | s/ preto | AA |
| --- | --- | --- | --- | --- |
| #7F91A4 | — | 3.24 | 6.49 | ok |
| #103053 | — | 13.38 | 1.57 | ok |
| #7EA426 | — | 2.91 | 7.23 | ok |
| #FBFBFB | — | 1.03 | 20.29 | ok |
| #418BDA | — | 3.54 | 5.93 | ok |
| #091624 | — | 18.23 | 1.15 | ok |
<!-- fe:auto:end:a11y -->

## Análise

### Interações

O arquivo **não tem nenhum protótipo conectado**. As abas, os cards e o popover são estáticos. Portanto:

- A navegação entre Overview / Work items / Pull requests / Pipelines precisa ser definida (troca de rota ou de estado).
- Hover, foco, pressed, disabled e carregamento não existem no design.
- O popover `Aviso` aparece aberto no `Board +` sem gatilho documentado; provavelmente abre ao passar o mouse ou clicar no card.

### Responsividade

Não há evidência de responsividade: as três larguras encontradas (900, 860 e 417) são tamanhos de canvas, não breakpoints. O layout de 900px com duas colunas fixas (326 + 526) não se adapta sozinho. Se houver requisito de tela menor, isso precisa ser desenhado — não inferido.

### Acessibilidade

Contrastes calculados sobre a superfície real `#FBFBFB`:

| Uso | Cor | Contraste | AA (12px) |
|---|---|---|---|
| Texto primário | `#103053` | 12,93:1 | passa |
| Aba padrão | `#7F91A4` | 3,13:1 | **falha** |
| Aba selecionada | `#7EA426` | 2,81:1 | **falha** |
| Tag Success | `#FBFBFB` sobre `#7EA426` | 2,81:1 | **falha** |
| Tag Danger | `#FBFBFB` sobre `#DF4444` | 4,02:1 | **falha** |
| Tag Inactive | `#FBFBFB` sobre `#7F91A4` | 3,13:1 | **falha** |
| Tag Alert | `#FBFBFB` sobre `#E5D13A` | 1,50:1 | **falha** |
| Tag Info | `#FBFBFB` sobre `#418BDA` | 3,42:1 | **falha** |

Além do contraste:

- Abas têm 22px de altura e tags 24px — abaixo do alvo de toque de 44px se forem interativas.
- Ícones de 16px são pequenos para clique.
- Texto de 12px com line-height de 100% (12px) é apertado para leitura.
- As tags usam **apenas cor** para indicar estado (Success/Danger/Alert); adicione ícone ou rótulo textual.
- Não há estado de foco visível definido.

Recomendação: escurecer as cores de status para uso como **texto** sobre superfície clara (mantendo o fundo colorido só com o texto branco em variantes com contraste ≥ 4,5), e implementar abas com `role="tablist"`, `aria-selected` e navegação por setas.

## Anotações

_(livre — não é sobrescrito)_
