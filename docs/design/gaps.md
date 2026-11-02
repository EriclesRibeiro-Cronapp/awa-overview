# Lacunas de design — AWA Overview

Comportamentos necessários que não estão documentados no Figma ou em
`docs/design/`. Cada lacuna DEVE ser resolvida na especificação antes da
implementação correspondente. Em conflito, a seção de análise manual prevalece
sobre blocos `fe:auto` defasados.

| ID | Lacuna | Impacto | Decisão necessária | Origem | Status |
|---|---|---|---|---|---|
| G-01 | Comportamento em janelas menores que 900×700 | Layout quebra ou corta conteúdo | Tamanho mínimo, scroll e empilhamento | `screens.md`, `behavior.md` | Aberto |
| G-02 | Navegação entre abas (Overview, Work items, Pull requests, Pipelines) | Não há fluxo nem rota definidos | Troca de estado/rota e preservação de contexto | `behavior.md` | Resolvido na 002 para Overview; demais abas indisponíveis |
| G-03 | Modal de configuração sem ação de salvar/testar | O usuário não consegue concluir a configuração | Botão "Salvar" adicionado no Figma; fluxo de validação definido no plano | `screens.md`, `assets` | Resolvido (botão + plano) |
| G-04 | Estados de loading, erro e vazio das tabelas | Tabelas ficam vazias/sem feedback | Componente de estado + mensagens por erro | `screens.md` | Aberto |
| G-05 | Tela Pull requests com a aba "Work items" selecionada | Navegação inconsistente | Corrigir a aba selecionada no Figma ou na implementação | `screens.md` | Aberto |
| G-06 | `Tag` com `type` padrão `Danger` | Estado padrão semanticamente errado | Definir padrão neutro (Info ou Inactive) | `components.md` | Resolvido na 002: `type` obrigatório |
| G-07 | Contraste abaixo de AA em abas e tags | Interface inacessível | Ajustar cores e registrar o desvio visual | `behavior.md` | Resolvido na 002: abas, tags e textos com contraste AA |
| G-08 | Tokens de hover e `#FFCC00` ausentes em `tokens.css` | Implementação não tem todos os valores | Reextrair do Figma quando a API liberar | `tokens.md` | Aberto |
| G-09 | Cards não são componentes no Figma | Anatomia e variantes não são reutilizáveis | Componentizar ou especificar por tela | `components.md` | Aberto |
| G-10 | Sem estados de validação/erro no formulário de configuração | Usuário não entende PAT/org inválidos | Mensagens por campo e por erro de API definidas no plano | `screens.md` | Resolvido na implementação |
| G-11 | Sem ajuda sobre como criar/revogar o PAT e escopos | Usuário pode usar token amplo ou inseguro | Texto de ajuda, link e escopos read-only | `screens.md` | Resolvido na implementação |
| G-12 | Seletores de projeto/time sem fonte/estado vazio | Não se sabe o que é carregado nem o que fazer sem dados | Consulta por projeto e estados de vazio/erro | `screens.md`, `components.md` | Resolvido na implementação |
| G-13 | Ícones com `fill` fixo | Não suportam hover/disabled | Usar `currentColor` sem alterar geometria | `assets.md` | Aceito na constituição |
| G-14 | Sem política de frescor/refresh/staleness | Dados velhos ou excesso de chamadas | TTL, refresh manual/automático e indicador | `screens.md` | Resolvido na 002: cache de 5 min + atualização manual/abertura |
| G-15 | Sem regras de DPI, foco, teclado e janela | Layout e acessibilidade quebram no desktop | Definir escala, foco visível e atalhos | `behavior.md` | Parcial: foco/teclado e tamanho mínimo; DPI pendente |
| G-16 | Primeira execução sem configuração | App abre sem PAT/org e sem estado definido | Tela/estado de configuração inicial obrigatória | `screens.md` | Resolvido na implementação |
| G-17 | Troca de organização e limpeza de cache | Dados de uma org podem persistir para outra | Definir troca, limpeza e confirmação | `screens.md`, `behavior.md` | Parcial: troca limpa cache; confirmação de troca pendente |
| G-18 | Modal sem footer e sem estados de sucesso/erro | Falta fechamento do fluxo | Definir footer e feedback pós-salvar | `screens.md` | Resolvido na implementação |
| G-19 | Sem comportamento de cópia/exibição do PAT | Risco de exposição | Mascarar, não recopiar e nunca reexibir | `screens.md`, segurança | Aceito na constituição |
| G-20 | Proteção visual e substituição do cofre | Exposição acidental do PAT em tela | Feature futura para mascarar, substituir valores e evitar vazamento visual | Decisão do usuário em 02/11 | Planejado |
| G-21 | Rótulos "Project products" e "Time" sem semântica documentada | Seletor de projeto/time pode ser interpretado de outra forma | Reutilizar os seletores de projeto e time da feature 001 no cabeçalho | `screens.md` | Resolvido na 002 |
| G-22 | Limite de itens por card não documentado | Cards podem transbordar ou esconder itens | Adotar o conteúdo do Figma: até 3 work items, 1 PR e 1 pipeline | `screens.md` | Resolvido na 002 |
| G-23 | Estados de loading/erro dos cards não desenhados | Cards podem ficar em branco ou bloquear a tela | Estados independentes por card, com retry e preservação dos demais | `screens.md` | Resolvido na 002 |
| G-24 | PAT sem escopo de Work Items/Build retorna 401 nesses endpoints | Cards falham mesmo com token válido | Distinguir identidade válida de falta de escopo e orientar o usuário | Overview | Resolvido na 002 |
| G-25 | Export `19:237` da tela Work items sem título/abas, divergente da análise manual | Layout da tela pode ficar ambíguo | Seguir a análise manual revisada em 01/11 (título, resumo, filtros e tabela) | `screens.md`, `assets` | Resolvido na 003 |
| G-26 | Larguras fixas dos filtros (46/92/57/54) truncam valores longos | “Concluído”/“Em andamento” ficam cortados no select | Ampliar os selects para 70/120/110/80 e validar no Figma | `screens.md` | Resolvido na 003 |
| G-27 | Tela Pull requests sem screenshot/export próprio | Detalhes visuais dependem só da análise manual | Reutilizar a estrutura de Work items e registrar a decisão | `screens.md`, `assets` | Resolvido na 004 |
| G-28 | Tela Pipelines sem screenshot/export próprio | Detalhes visuais dependem só da análise manual | Reutilizar a estrutura das tabelas e registrar a decisão | `screens.md`, `assets` | Resolvido na 005 |
| G-29 | Amarelo `#FFCC00` de sucesso não passa AA para ícone | Status pode ficar invisível para baixa visão | Usar tom escurecido `#8A6D00` e manter ícone + rótulo | `screens.md`, `components.md` | Resolvido na 005 |
| G-30 | Vermelho `#DF4444` em texto de erro tem contraste 4,02:1 | Mensagens de erro podem falhar AA | Usar `#B00020` para texto; manter `#DF4444` em bordas/ícones | `behavior.md` | Resolvido na auditoria de cores |

## Regras

- Nenhuma lacuna DEVE ser preenchida por invenção do agente; a decisão DEVE ser
  registrada na spec ou em ADR.
- Lacunas que afetam acessibilidade têm prioridade sobre fidelidade visual.
- Ao resolver uma lacuna, atualize esta tabela e o documento afetado.
