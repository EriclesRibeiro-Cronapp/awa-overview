# Observabilidade — schema de log e catálogo de erros

## Schema de log

Todo log DEVE ser estruturado (JSON ou pares chave/valor) com os campos abaixo.
Campos ausentes DEVEM ser omitidos, nunca preenchidos com `null` genérico.

| Campo | Obrigatório | Descrição |
|---|---|---|
| `timestamp` | sim | ISO 8601 com timezone |
| `level` | sim | `error`, `warn`, `info`, `debug` |
| `event` | sim | Nome estável em `dominio.acao` (ex.: `azuredevops.listProjects`) |
| `code` | em erro | Código do catálogo (ex.: `CFG-003`) |
| `correlationId` | sim | Identificador da operação/refresh |
| `component` | sim | Módulo/camada de origem |
| `operation` | sim | Operação de negócio |
| `durationMs` | quando aplicável | Duração da chamada |
| `outcome` | sim | `success`, `failure`, `partial` |
| `context` | opcional | Dados redigidos e não sensíveis |

### Nunca registrar

- PAT, `Authorization`, cookies ou qualquer header de credencial.
- Query string completa de URLs.
- Conteúdo integral de work items, PRs ou mensagens.
- Nome/e-mail de pessoas além do necessário para diagnóstico.
- Corpo de resposta da API que possa conter dados pessoais.

Prefira IDs (`projectId`, `workItemId`) a títulos e nomes.

## Catálogo de erros

| Código | Significado | Mensagem ao usuário | Retry? |
|---|---|---|---|
| `CFG-001` | Organização não informada | "Informe o nome da organização." | não |
| `CFG-002` | PAT não informado | "Informe o Personal Access Token." | não |
| `CFG-003` | PAT inválido ou expirado (401) | "O token é inválido ou expirou. Gere um novo PAT read-only." | não |
| `CFG-004` | Sem permissão (403) | "O token não tem permissão para acessar este recurso." | não |
| `CFG-005` | Rede/timeout | "Não foi possível conectar. Verifique a rede e tente novamente." | sim, com backoff |
| `CFG-006` | Rate limit (429) | "O Azure DevOps limitou as requisições. Aguarde e tente novamente." | sim, respeitando `Retry-After` |
| `CFG-007` | Erro do servidor (5xx) | "O Azure DevOps está indisponível no momento." | sim, limitado |
| `CFG-008` | Erro inesperado | "Ocorreu um erro inesperado. Consulte o diagnóstico." | não |
| `CFG-009` | Organização não encontrada (404) | "Organização não encontrada. Verifique o nome e tente novamente." | não |
| `DATA-001` | Cache local corrompido | "Os dados locais precisam ser recriados." | recriar cache |
| `DATA-002` | Migração de dados falhou | "Não foi possível atualizar os dados locais." | não; oferecer reset |
| `UI-001` | Falha de renderização de uma seção | "Não foi possível exibir esta seção." | recarregar seção |

## Exportação de diagnóstico

- Inclui: versão do app, SO, nome da organização, configurações não sensíveis,
  últimos logs redigidos e estado das integrações.
- Exclui: PAT, cache de dados da organização, headers e qualquer segredo.
- Exige ação explícita do usuário e mostra um resumo antes de salvar.
- A retenção local de logs DEVE ser curta e configurável (proposta: 7 a 30 dias).
