# Research — Tela Pipelines

## Decisões

### 1. Endpoint de execuções

- `GET /{project}/_apis/build/builds?$top=500&queryOrder=finishTimeDescending&api-version=7.1`.
- Todos os resultados; ordenação por `finishTime` descendente.
- Limite 500; `truncated` quando houver mais.
- Escopo do projeto; time não altera o escopo.

### 2. Descrição da definição

- `GET /{project}/_apis/build/definitions?api-version=7.1`.
- Associar `definition.id` do build à definição e usar `description`.
- Fallback: `buildNumber`; se vazio, `—`.
- A chamada extra é cacheada junto do snapshot.

### 3. Status e cores

| Resultado/status | Ícone | Texto | Cor |
|---|---|---|---|
| succeeded | checkbox-circle-line | Sucesso | `#8A6D00` |
| failed | close-circle-line | Falha | `#B00020` |
| partiallySucceeded | spam-line | Parcial | `#6B5A00` |
| canceled | subtract-line | Cancelado | `#386089` |
| inProgress | refresh-line | Em andamento | `#005A9E` |
| notStarted | timer-line | Na fila | `#386089` |
| desconhecido | spam-line | Desconhecido | `#386089` |

O design usa `#FFCC00` para sucesso; sobre `#FBFBFB` o contraste é insuficiente para
ícone (3:1). Usar `#8A6D00` e registrar em gaps.

### 4. Duração

- `finishTime - startTime` em segundos.
- Formatar `Xs` até 59s; `Xm Ys` acima.
- Sem `finishTime` ou datas inválidas → `—`.
- Data: `DD/MM/AAAA HH:MM` (pt-BR).

### 5. Tabela

- Colunas Pipeline, Detalhes, Executado em, Acessar.
- Cabeçalho/linhas 47px; 4×47 = 188px (cabeçalho + 3 linhas).
- Pipeline: ícone + nome semibold.
- Executado em: `calendar-2-line` 16 + data; `timer-line` 16 + duração.
- Sem divisórias entre linhas; cabeçalho sticky; rolagem vertical.
- Descrição em 12px, truncada em uma linha.

### 6. Busca

- 499×28, placeholder "Buscar por pipeline...".
- Filtra nome e descrição, case-insensitive.
- Sem resultado → mensagem vazia.
- Filtragem client-side.

### 7. Cache e erros

- `pipelines-cache.json.enc`, TTL 300s, chave `org|projeto`.
- Identidade via `connectionData` antes da lista; 401 com identidade válida →
  `CFG-004` (escopo Build).
- Fallback de cache em rede/429/5xx; sem cache → erro.

### 8. Navegação

- `ProductTabId` inclui `pipelines`; aba habilitada.
- Contexto elevado em `ConfiguredApp`; preserva projeto/time.

### 9. Design

- Sem screenshot próprio; seguir `screens.md` e a estrutura das tabelas anteriores.
- Título `rocket-2-line` 24px + texto 16px bold.
- Status por ícone + rótulo acessível (não apenas cor).
- Ícones de data/duração com rótulos acessíveis.

## Riscos

| Risco | Mitigação |
|---|---|
| Muitas execuções | Limite 500 e cache |
| Rate limit | TTL, retry e chamada única |
| Definição sem descrição | Fallback buildNumber/— |
| Data/duração inválida | Fallback "—" |
| Status desconhecido | Ícone neutro + texto |
| Sem screenshot | Estrutura documentada + snapshot local |
