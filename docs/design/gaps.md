# Lacunas de design — AWA Overview

Comportamentos necessários que não estão documentados no Figma ou em
`docs/design/`. Cada lacuna DEVE ser resolvida na especificação antes da
implementação correspondente. Em conflito, a seção de análise manual prevalece
sobre blocos `fe:auto` defasados.

| ID | Lacuna | Impacto | Decisão necessária | Origem | Status |
|---|---|---|---|---|---|
| G-01 | Comportamento em janelas menores que 900×700 | Layout quebra ou corta conteúdo | Tamanho mínimo, scroll e empilhamento | `screens.md`, `behavior.md` | Aberto |
| G-02 | Navegação entre abas (Overview, Work items, Pull requests, Pipelines) | Não há fluxo nem rota definidos | Troca de estado/rota e preservação de contexto | `behavior.md` | Aberto |
| G-03 | Modal de configuração sem ação de salvar/testar | O usuário não consegue concluir a configuração | Botão "Salvar" adicionado no Figma em 02/11; falta validar o PAT e definir feedback | `screens.md`, `assets` | Botão resolvido; validação pendente |
| G-04 | Estados de loading, erro e vazio das tabelas | Tabelas ficam vazias/sem feedback | Componente de estado + mensagens por erro | `screens.md` | Aberto |
| G-05 | Tela Pull requests com a aba "Work items" selecionada | Navegação inconsistente | Corrigir a aba selecionada no Figma ou na implementação | `screens.md` | Aberto |
| G-06 | `Tag` com `type` padrão `Danger` | Estado padrão semanticamente errado | Definir padrão neutro (Info ou Inactive) | `components.md` | Aberto |
| G-07 | Contraste abaixo de AA em abas e tags | Interface inacessível | Ajustar cores e registrar o desvio visual | `behavior.md` | Aberto |
| G-08 | Tokens de hover e `#FFCC00` ausentes em `tokens.css` | Implementação não tem todos os valores | Reextrair do Figma quando a API liberar | `tokens.md` | Aberto |
| G-09 | Cards não são componentes no Figma | Anatomia e variantes não são reutilizáveis | Componentizar ou especificar por tela | `components.md` | Aberto |
| G-10 | Sem estados de validação/erro no formulário de configuração | Usuário não entende PAT/org inválidos | Mensagens por campo e por erro de API | `screens.md` | Aberto |
| G-11 | Sem ajuda sobre como criar/revogar o PAT e escopos | Usuário pode usar token amplo ou inseguro | Texto de ajuda, link e escopos read-only | `screens.md` | Aberto |
| G-12 | Seletores de projeto/time sem fonte/estado vazio | Não se sabe o que é carregado nem o que fazer sem dados | Definir consulta, cache, vazio e erro; times são consultados por projeto, não por organização | `screens.md`, `components.md` | Aberto |
| G-13 | Ícones com `fill` fixo | Não suportam hover/disabled | Usar `currentColor` sem alterar geometria | `assets.md` | Aceito na constituição |
| G-14 | Sem política de frescor/refresh/staleness | Dados velhos ou excesso de chamadas | TTL, refresh manual/automático e indicador | `screens.md` | Aberto |
| G-15 | Sem regras de DPI, foco, teclado e janela | Layout e acessibilidade quebram no desktop | Definir escala, foco visível e atalhos | `behavior.md` | Aberto |
| G-16 | Primeira execução sem configuração | App abre sem PAT/org e sem estado definido | Tela/estado de configuração inicial obrigatória | `screens.md` | Aberto |
| G-17 | Troca de organização e limpeza de cache | Dados de uma org podem persistir para outra | Definir troca, limpeza e confirmação | `screens.md`, `behavior.md` | Aberto |
| G-18 | Modal sem footer e sem estados de sucesso/erro | Falta fechamento do fluxo | Definir footer e feedback pós-salvar | `screens.md` | Aberto |
| G-19 | Sem comportamento de cópia/exibição do PAT | Risco de exposição | Mascarar, não recopiar e nunca reexibir | `screens.md`, segurança | Aceito na constituição |
| G-20 | Proteção visual e substituição do cofre | Exposição acidental do PAT em tela | Feature futura para mascarar, substituir valores e evitar vazamento visual | Decisão do usuário em 02/11 | Planejado |

## Regras

- Nenhuma lacuna DEVE ser preenchida por invenção do agente; a decisão DEVE ser
  registrada na spec ou em ADR.
- Lacunas que afetam acessibilidade têm prioridade sobre fidelidade visual.
- Ao resolver uma lacuna, atualize esta tabela e o documento afetado.
