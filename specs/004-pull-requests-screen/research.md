# Research — Tela Pull requests

## Decisões

### 1. Endpoint e escopo

- `GET /{project}/_apis/git/pullrequests?searchCriteria.status=all&$top=1000&api-version=7.1`.
- Todos os status do projeto selecionado; o time não altera o escopo.
- Ordenação por `creationDate` desc.
- Limite de 1.000 PRs; `truncated` quando houver mais.
- PRs são escopados ao projeto (não a um time).

### 2. Status

| API | Texto | Cor acessível |
|---|---|---|
| `active` | Aberto | `#6B5A00` (amarelo escurecido) |
| `completed` | Concluído | `#4F7A00` |
| `abandoned` | Abandonado | `#386089` |
| desconhecido | valor bruto | `#386089` |

O design usa `#E5D13A` para Aberto; sobre `#FBFBFB` o contraste é 1,50:1 e falha
AA. Usar `#6B5A00` e registrar em gaps.

### 3. Tabela

- Colunas ID, Título, Status, Acessar.
- Cabeçalho 41px; linhas 49px; 41 + 3×49 = 188px visíveis.
- Título em até duas linhas (line-height 14).
- ID com prefixo `!`.
- Sem linhas divisórias, como Work items.
- Rolagem vertical no corpo; cabeçalho sticky.

### 4. Filtros

- Busca 499×28, placeholder "Buscar por ID ou título do PR...".
- ID aceita `!54678` e `54678`; busca por título case-insensitive.
- Status: Todos, Aberto, Concluído, Abandonado.
- Filtros client-side; sem resultado → mensagem vazia.

### 5. Cache e erros

- `pull-requests-cache.json.enc`, TTL 300s, chave `org|projeto`.
- Cache separado de Overview/Work items.
- Identidade via `connectionData` antes da lista para distinguir 401 de token
  inválido; 401 com identidade válida → `CFG-004`.
- Fallback de cache em rede/429/5xx; sem cache → erro.

### 6. Navegação

- `ProductTabId` inclui `pull-requests`; a aba fica habilitada.
- Contexto elevado em `ConfiguredApp`; trocar de aba preserva projeto/time.
- Pipelines permanece indisponível.

### 7. Design e acessibilidade

- Sem screenshot próprio; seguir `screens.md` e a estrutura de Work items.
- Título `git-pull-request-line` 24px + texto 16px bold.
- Status por texto + cor; foco visível; tabela semântica; link com rótulo.
- Cores do design para status não passam AA; correções registradas.

## Riscos

| Risco | Mitigação |
|---|---|
| Muitos PRs | Limite 1.000 e cache |
| Rate limit | TTL, retry e chamada única |
| Status desconhecido | Texto bruto com fallback |
| Sem screenshot | Estrutura documentada + snapshot visual local |
| Coluna Título longa | Clamp de duas linhas |
