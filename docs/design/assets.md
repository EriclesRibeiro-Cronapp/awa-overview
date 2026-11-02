# Assets

> Conteúdo entre marcadores `fe:auto` é gerado e sobrescrito. Escreva análises em **Análise** e notas livres em **Anotações**.

<!-- fe:auto:start:summary -->
Screenshots: **8** · Exports: **8** · Imagens: **0**
<!-- fe:auto:end:summary -->

<!-- fe:auto:start:screenshots -->
| Tela | Arquivo |
| --- | --- |
| Board vazio | [assets/screens/board-vazio--13-27.png](assets/screens/board-vazio--13-27.png) |
| Board - Work items | [assets/screens/board-work-items--19-237.png](assets/screens/board-work-items--19-237.png) |
| Board preenchido | [assets/screens/board-preenchido--15-136.png](assets/screens/board-preenchido--15-136.png) |
| Board + | [assets/screens/board--15-283.png](assets/screens/board--15-283.png) |
| Componentes | [assets/screens/componentes--29-486.png](assets/screens/componentes--29-486.png) |
| Tabs | [assets/screens/tabs--29-537.png](assets/screens/tabs--29-537.png) |
| Tabs | [assets/screens/tabs-2--29-547.png](assets/screens/tabs-2--29-547.png) |
| Tabs | [assets/screens/tabs-3--29-557.png](assets/screens/tabs-3--29-557.png) |
<!-- fe:auto:end:screenshots -->

<!-- fe:auto:start:exports -->
| Nó | Tipo | Formato | Escala | Arquivo |
| --- | --- | --- | --- | --- |
| Board vazio | FRAME | PNG | 1x | [assets/exports/board-vazio-13-27.png](assets/exports/board-vazio-13-27.png) |
| Board - Work items | FRAME | PNG | 1x | [assets/exports/board-work-items-19-237.png](assets/exports/board-work-items-19-237.png) |
| Board preenchido | FRAME | PNG | 1x | [assets/exports/board-preenchido-15-136.png](assets/exports/board-preenchido-15-136.png) |
| Board + | FRAME | PNG | 1x | [assets/exports/board-15-283.png](assets/exports/board-15-283.png) |
| Aviso | FRAME | PNG | 1x | [assets/exports/aviso-15-398.png](assets/exports/aviso-15-398.png) |
| Aviso | FRAME | PNG | 1x | [assets/exports/aviso-15-402.png](assets/exports/aviso-15-402.png) |
| Aviso | FRAME | PNG | 1x | [assets/exports/aviso-15-400.png](assets/exports/aviso-15-400.png) |
| Aviso | FRAME | PNG | 1x | [assets/exports/aviso-16-95.png](assets/exports/aviso-16-95.png) |
<!-- fe:auto:end:exports -->

<!-- fe:auto:start:images -->
_Nenhuma imagem de preenchimento baixada._
<!-- fe:auto:end:images -->

## Análise

**Screenshots.** Os 8 PNGs em `assets/screens/` são a melhor referência visual para conferência durante a implementação (renderizados em 2x). Use-os como comparação, não como asset de produção.

**Exports.** Os 8 PNGs em `assets/exports/` são os quatro boards e as quatro variações do popover `Aviso` (work items, PRs, pipelines, projeto), exportados a 1x. Servem como referência de estado, não como imagem a ser embutida.

**O que falta**
- **Ícones não foram exportados**: os componentes `*-line` não têm `exportSettings`. Exporte em SVG a partir do Figma antes de implementar (`spam-line`, `refresh-line`, `subtract-line`, `share-circle-line`, `check-line`, `filter-3-line`).
- Não há imagens de preenchimento no arquivo, então não há fotos/ilustrações a baixar.
- Não há logo/favicon.

### Ícones exportados (SVG)

Baixados via API em `assets/icons/`:

| Arquivo | Tamanho |
|---|---|
| `spam-line.svg` | 16×16 |
| `refresh-line.svg` | 16×16 |
| `subtract-line.svg` | 24×24 |
| `share-circle-line.svg` | 20×20 |
| `check-line.svg` | 20×20 |
| `filter-3-line.svg` | 16×16 |
| `settings-4-line.svg` | 20×20 |
| `close-line.svg` | 20×20 |
| `arrow-down-s-line.svg` | 16×16 |
| `newspaper-line.svg` | 24×24 |
| `git-pull-request-line.svg` | 24×24 |
| `rocket-2-line.svg` | 24×24 |
| `checkbox-circle-line.svg` | 24×24 |
| `close-circle-line.svg` | 24×24 |
| `calendar-2-line.svg` | 16×16 |
| `timer-line.svg` | 16×16 |

Os arquivos vêm com `fill` fixo (ex.: `#7EA426`), não `currentColor`. Para usar em componentes, troque o `fill` por `currentColor` e controle a cor pelo CSS.

### Estados renderizados

`assets/exports/states/tab-set.png` e `tag-set.png` são renders 3x dos conjuntos de componentes, incluindo os estados de hover adicionados no Figma. Use como referência visual enquanto a API de arquivo estiver em rate limit.

**Nomenclatura.** Os nomes atuais misturam nome do nó e id (`board--15-283`, `aviso-15-398`). Para produção, renomeie para o papel (`board-empty`, `board-work-items`, `board-filled`, `popover-*`).

## Anotações

_(livre — não é sobrescrito)_
