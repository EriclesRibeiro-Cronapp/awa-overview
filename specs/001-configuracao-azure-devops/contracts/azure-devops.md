# Contrato — Azure DevOps REST (somente leitura)

## Base e autenticação

- Base: `https://dev.azure.com/{organization}/_apis`
- Versão: `api-version=7.1`; `connectionData` usa `7.1-preview.1` (preview obrigatório)
- Autenticação: `Authorization: Basic base64(":" + PAT)`
- `X-TFS-FedAuthRedirect: Suppress` para receber 401 em vez de HTML de login.
- O PAT nunca vai para URL, query string ou log.
- HTTPS obrigatório com validação de certificado.
- Timeout padrão: 15s; retry apenas em 429 e 5xx.

## Endpoints

### 1. Identidade

`GET /connectionData?api-version=7.1-preview.1`

Retorna o usuário autenticado. Usado para validar o PAT e exibir "Conectado como"
quando disponível.

### 2. Projetos

`GET /projects?api-version=7.1&$top=100`

- Paginação por `x-ms-continuationtoken` no header de resposta.
- Continuar até não haver token ou atingir o limite de páginas (proteção contra
  loop).
- Campos usados: `id`, `name`, `state`, `visibility`, `url`.

### 3. Times do projeto

`GET /projects/{projectId}/teams?api-version=7.1`

- Times pertencem a projetos; não há lista global.
- Campos usados: `id`, `name`, `description`.
- `projectId` é injetado pelo serviço, não pelo renderer sem validação.

## Paginação e rate limit

- Toda listagem DEVE percorrer a continuação.
- 429: respeitar `Retry-After`; backoff exponencial com jitter; máximo de 3
  tentativas.
- 5xx: retry limitado; se persistir, retornar `CFG-007`.
- 401: PAT inválido/expirado; limpar cofre e cache.
- 403: válido sem permissão; manter configuração.
- 404: organização ou recurso inexistente; não apagar a configuração sem confirmar
  que a organização existe.

## Mapeamento de erros

| HTTP | Código | Ação |
|---|---|---|
| 401 | `CFG-003` | Limpar PAT/cache e pedir novo token |
| 403 | `CFG-004` | Manter configuração; informar permissão |
| 404 | `CFG-009` | Informar organização/recurso não encontrado |
| 429 | `CFG-006` | Aguardar `Retry-After` e tentar de novo |
| 5xx | `CFG-007` | Erro do servidor; retry limitado |
| timeout/rede | `CFG-005` | Erro de conexão; permitir tentar novamente |
| outro | `CFG-008` | Erro inesperado; registrar diagnóstico |

## Proibições

- Nenhum `POST`, `PUT`, `PATCH` ou `DELETE`.
- Nenhum escopo de escrita solicitado.
- Nenhum dado de work item/PR/pipeline nesta feature.
- Nenhuma chamada sem `api-version`.
