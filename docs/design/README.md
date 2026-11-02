# Documentação de design — AWA - Overview

> Conteúdo entre marcadores `fe:auto` é gerado e sobrescrito. Escreva análises em **Análise** e notas livres em **Anotações**.

<!-- fe:auto:start:scope -->
| Campo | Valor |
| --- | --- |
| Arquivo | AWA - Overview |
| Fonte | https://www.figma.com/design/XBNU4UZFkOEezETFxSMALm/AWA---Overview?node-id=0-1 |
| Escopo | Página "Page 1" |
| Versão Figma | 2416580233686232225 |
| Última alteração no Figma | 2026-10-31T20:06:06Z |
| Extraído em | 2026-10-31T20:38:46.495Z |
<!-- fe:auto:end:scope -->

<!-- fe:auto:start:index -->
| Arquivo | Conteúdo |
| --- | --- |
| `foundations.md` | Cores, tipografia, espaçamento, raios, sombras, grids, breakpoints |
| `tokens.md` | Tokens consolidados + mapeamento para CSS/Tailwind |
| `components.md` | Inventário de 13 componente(s) |
| `screens.md` | 8 tela(s) com seções e medidas |
| `assets.md` | Screenshots, exports e imagens |
| `behavior.md` | Protótipos, responsividade e acessibilidade |
| `tokens.css` | CSS variables geradas |
| `tailwind.config.js` | Tema Tailwind gerado |
| `_raw/` | JSON bruto do Figma + modelo normalizado |
| `_state.json` | Controle incremental (não editar) |
<!-- fe:auto:end:index -->

<!-- fe:auto:start:gaps -->
- Variáveis do Figma não acessíveis (endpoint exclusivo de organizações Enterprise). Tokens foram inferidos por estilos e frequência de uso.
- Nenhum estilo publicado encontrado no arquivo; nomes de tokens são inferidos.
<!-- fe:auto:end:gaps -->

## Análise

**O que é o projeto.** AWA Overview é um dashboard de acompanhamento de Azure DevOps em uma tela fixa de **900×700**: cabeçalho, abas (Overview, Work items, Pull requests, Pipelines), três cards de resumo e rodapé com horário da última atualização.

**Escopo real.** A página "Page 1" tem 4 telas de produto — `Board vazio`, `Board - Work items`, `Board preenchido` e `Board +` — mais uma folha de componentes (`Componentes`) e 3 prévias de abas (`Tabs`). Para implementação, trate as 4 primeiras como telas; as demais são material de apoio.

**Cobertura.** Extração REST: 498 nós, 158 textos e 8 telas. Via MCP (01/11): mais 3 telas (`Pull requests`, `Pipelines` e `Modal de configuração`), **16 ícones em SVG**, 27 tokens, 8 screenshots e 8 exports.

**Nomenclatura.** Cores, tipografia, espaçamento, componentes, tabelas, modais e telas seguem o padrão definido em `tokens.md` e aplicado por `docs/design/tokens.naming.json`.

**Atualização de 01/11 (via MCP).** O arquivo ganhou as telas de Pull requests e Pipelines, o modal de configuração e 4 ícones (`checkbox-circle-line`, `close-circle-line`, `calendar-2-line`, `timer-line`). As especificações estão em `screens.md` e `components.md`. O Tab foi corrigido: no Selected+Hover, texto e borda passam para `#7AAE00`. A tela **Work items** foi reorganizada: título próprio, resumo com separadores em `y=150`, filtros em `y=226` e tabela em grid a partir de `y=270`.

**O que ainda impede precisão total:** comportamento responsivo, navegação entre abas, ação de salvar do modal e estados de carregamento/erro — nenhum existe no arquivo. Fora isso, a documentação cobre estrutura, medidas, cores e tipografia em nível de implementação.

**Verificação de 02/11:** nenhuma tela, ícone ou variante nova em relação a 01/11. Estrutura inalterada (9 telas de topo, 16 ícones, 4 variantes de Tab e 10 de Tag).

**Lacunas que impactam o desenvolvimento**
- O token não tem `library_content:read`, então estilos e componentes publicados vieram 403. **Todos os tokens são inferidos** e os nomes precisam ser acordados com o time.
- Não há layout grid declarado nem variantes responsivas: o design existe em uma única largura (900px).
- Zero interações de protótipo — navegação, hover, foco, loading e erro não estão documentados.
- Cards são frames, não componentes; não existe componente de botão nem de card.

**Decisões pendentes**
1. Nomes definitivos dos tokens (cores/escala) e se serão variáveis do Figma ou CSS vars.
2. Comportamento responsivo: qual largura mínima, o que empilha, o que some.
3. Estados de carregamento/erro dos três cards e comportamento de scroll das listas.
4. Proteção visual e substituição do cofre do PAT (feature futura; o botão de salvar já existe).

**Para melhorar a extração:** adicione o escopo `library_content:read` ao token e rode `fetch` novamente. Isso traz os nomes reais dos estilos publicados e o inventário oficial de componentes; a nomenclatura adotada continua sendo aplicada por `tokens.naming.json`, sem perder as análises escritas aqui.

## Anotações

_(livre — não é sobrescrito)_

## Como atualizar

```sh
node "<skill-dir>/scripts/figma.mjs" fetch --url "<link do Figma>" --out "<esta pasta>"
node "<skill-dir>/scripts/figma.mjs" status --out "<esta pasta>"
node "<skill-dir>/scripts/figma.mjs" build --out "<esta pasta>"
```

## Changelog

<!-- fe:auto:start:changelog -->
- **2026-11-02 16:22** · tokens.md » summary (1 linhas)
- **2026-11-02 16:22** · tokens.md » table (29 linhas de dados)
- **2026-11-02 16:22** · tokens.md » mapping (56 linhas)
- **2026-11-02 16:21** · tokens.md » summary (1 linhas)
- **2026-11-02 16:21** · tokens.md » table (26 linhas de dados)
- **2026-11-02 16:21** · tokens.md » mapping (50 linhas)
- **2026-10-31 23:24** · components.md » list (25 linhas de dados)
- **2026-10-31 20:56** · README.md » scope (5 linhas de dados)
- **2026-10-31 20:56** · README.md » index (10 linhas de dados)
- **2026-10-31 20:56** · README.md » gaps (2 linhas)
- **2026-10-31 20:56** · foundations.md » summary (2 linhas)
- **2026-10-31 20:56** · components.md » summary (1 linhas)
- **2026-10-31 20:56** · components.md » inventory (13 linhas de dados)
- **2026-10-31 20:56** · components.md » list (25 linhas de dados)
- **2026-10-31 20:54** · screens.md » list (221 linhas de dados)
- **2026-10-31 20:53** · components.md » inventory (2 linhas de dados)
- **2026-10-31 20:53** · components.md » list (3 linhas de dados)
- **2026-10-31 20:53** · foundations.md » typography (10 linhas de dados)
- **2026-10-31 20:53** · tokens.md » summary (1 linhas)
- **2026-10-31 20:53** · tokens.md » table (27 linhas de dados)
- **2026-10-31 20:53** · tokens.md » mapping (52 linhas)
<!-- fe:auto:end:changelog -->
