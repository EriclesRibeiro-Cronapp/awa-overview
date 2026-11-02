# Contrato IPC — Overview

## Canal

`overview:load`

### Entrada

```ts
interface OverviewLoadInput {
  force?: boolean; // true ignora cache fresco e consulta o Azure DevOps
}
```

O renderer **não** envia organização, PAT, projeto ou time. O main resolve tudo a
partir da configuração e da seleção persistida, evitando que a interface escolha
um escopo arbitrário.

### Saída

```ts
type OverviewLoadResult =
  | { ok: true; data: OverviewView }
  | { ok: false; error: AppError };

interface OverviewView {
  context: {
    organization: string;
    projectId: string;
    projectName: string;
    teamId: string | null;
    teamName: string | null;
  } | null;
  workItems: CardResult<WorkItemSummary[]>;
  pullRequest: CardResult<PullRequestSummary | null>;
  pipeline: CardResult<PipelineRunSummary | null>;
  fetchedAt: string | null;
  stale: boolean;
}
```

`CardResult<T>` e os resumos estão em [data-model.md](../data-model.md).

## Regras

- Sem projeto selecionado, retornar `ok: true` com `context: null` e cards vazios
  (`ok: true`, `data: []`/`null`). A UI exibe orientação para selecionar.
- Sem configuração/PAT, retornar `ok: false` com `CFG-001`/`CFG-002`.
- Cada card pode falhar isoladamente; o resultado geral continua `ok: true`.
- `force=true` ignora a validade do cache, mas ainda pode devolver cache com
  `stale=true` se a consulta falhar.
- O main nunca devolve PAT, cabeçalhos, URLs de API internas ou detalhes de
  credenciais.
- Erros usam `shared/errors.ts`; mensagens são acionáveis e sem segredos.
- `fetchedAt` é o maior instante entre os cards bem-sucedidos.

## Compatibilidade

O contrato é aditivo à API da feature 001. Nenhum canal existente muda de formato.
O preload expõe `window.api.overview.load(input?)`.

## Testes de contrato

- Sem configuração → `CFG-001`.
- Sem projeto → `context: null`, cards vazios.
- Cache fresco → não chama o cliente.
- `force=true` → chama o cliente e atualiza `fetchedAt`.
- Falha de um card → os outros continuam `ok: true`.
- Falha com cache → card `stale: true`.
- Resposta nunca contém PAT.
