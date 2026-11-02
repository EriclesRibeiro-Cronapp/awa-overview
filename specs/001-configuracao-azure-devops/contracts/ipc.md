# Contrato IPC — renderer ↔ main

Todo acesso do renderer ao sistema passa pelo preload (`contextBridge`). O renderer
não tem Node, não lê arquivos e nunca recebe o PAT em claro.

## Tipos

```ts
type AppError = {
  code: string;        // ex.: CFG-003
  message: string;     // mensagem ao usuário, PT-BR
  retryable: boolean;
  details?: string;    // redigido, sem segredo
};

type ConfigView = {
  organization: string | null;
  status: "unconfigured" | "configured" | "invalid";
  hasPat: boolean;
  patLast4: string | null;
  selectedProjectId: string | null;
  selectedTeamId: string | null;
  lastValidatedAt: string | null;
};

type SaveConfigResult =
  | { ok: true; patLast4: string; user?: { displayName: string } }
  | { ok: false; error: AppError };

type Project = {
  id: string;
  name: string;
  state: string;
  visibility?: string;
  url?: string;
};

type Team = {
  id: string;
  name: string;
  projectId: string;
  description?: string;
};

type ListResult<T> =
  | { ok: true; items: T[]; stale: boolean; fetchedAt: string }
  | { ok: false; error: AppError };
```

## Métodos

| Canal | Entrada | Saída | Regras |
|---|---|---|---|
| `config:get` | — | `ConfigView` | Nunca retorna PAT |
| `config:save` | `{ organization: string; pat: string }` | `SaveConfigResult` | Valida, cifra e salva; erro não persiste |
| `config:remove` | — | `{ ok: true } \| { ok: false; error }` | Apaga PAT, cache e chave |
| `projects:list` | `{ force?: boolean }` | `ListResult<Project>` | Usa cache se válido; `stale` indica cache vencido |
| `teams:list` | `{ projectId: string; force?: boolean }` | `ListResult<Team>` | Times do projeto; valida `projectId` |
| `session:select` | `{ projectId?: string \| null; teamId?: string \| null }` | `{ ok: boolean; error?: AppError }` | Valida pertencimento |
| `diagnostics:export` | — | `{ ok: true; path: string }` | Sem PAT/cache integral |
| `app:version` | — | `{ version: string }` | Somente leitura |

## Regras de segurança

1. `config:save` recebe o PAT, valida e cifra no main; o retorno contém apenas
   `patLast4`.
2. Nenhum canal devolve `encryptedPat` ou o PAT em claro.
3. Entradas são validadas com Zod no main; o renderer não é fonte de confiança.
4. Erros retornam código e mensagem; detalhes técnicos são redigidos.
5. Timeout padrão de 15s para chamadas de rede; o renderer não controla headers.
6. Nenhum método de escrita no Azure DevOps.

## Eventos

Não há eventos push nesta feature. O renderer atualiza por chamada explícita após
salvar ou remover a configuração.
