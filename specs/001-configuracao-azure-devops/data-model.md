# Data Model — Configuração e conexão com Azure DevOps

## Entidades

### OrganizationConfig

Configuração não sensível da organização ativa.

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `organization` | string | sim | Nome informado, sem espaços nas pontas |
| `normalizedOrganization` | string | sim | Minúsculo, formato `^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$` |
| `status` | enum | sim | `unconfigured`, `configured`, `invalid` |
| `lastValidatedAt` | ISO 8601 | não | Última validação bem-sucedida |
| `schemaVersion` | integer | sim | Versão do formato local |

### CredentialRecord

Representa o PAT no cofre. Nunca é exposto ao renderer.

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `encryptedPat` | base64 | sim | Blob cifrado pelo `safeStorage` |
| `patLast4` | string(4) | sim | Últimos 4 caracteres para exibição |
| `createdAt` | ISO 8601 | sim | Data da gravação |
| `updatedAt` | ISO 8601 | sim | Data da última troca |
| `schemaVersion` | integer | sim | Versão do formato |

### Project

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | string (UUID) | sim | Identificador do Azure DevOps |
| `name` | string | sim | Nome exibido |
| `state` | string | sim | `wellFormed`, `deleting`, etc. |
| `visibility` | string | não | `private`/`public` |
| `url` | string | não | Link de navegação |

### Team

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | string (UUID) | sim | Identificador do time |
| `name` | string | sim | Nome exibido |
| `projectId` | string | sim | Projeto ao qual pertence |
| `description` | string | não | Descrição opcional |

### CacheSnapshot

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `schemaVersion` | integer | sim | Versão do cache |
| `organization` | string | sim | Organização do snapshot |
| `projects` | Project[] | sim | Lista completa |
| `teamsByProject` | map<string, Team[]> | sim | Chave = projectId |
| `fetchedAt` | ISO 8601 | sim | Momento da coleta |
| `ttlSeconds` | integer | sim | Validade do snapshot |

### SessionContext

| Campo | Tipo | Regra |
|---|---|---|
| `selectedProjectId` | string \| null | Deve existir em `projects` |
| `selectedTeamId` | string \| null | Deve existir nos times do projeto |

## Relacionamentos

- `OrganizationConfig` 1—1 `CredentialRecord` (quando configurada).
- `OrganizationConfig` 1—N `Project`.
- `Project` 1—N `Team`.
- `CacheSnapshot` 1—1 `OrganizationConfig.organization`.
- `SessionContext` referencia `Project` e `Team` do snapshot.

## Máquina de estados

```text
unconfigured
  └─ salvar(org, pat) ─→ validating
                          ├─ sucesso ─→ configured
                          └─ erro ───→ unconfigured (nada persistido)

configured
  ├─ usar cache offline ─→ stale (indicador visual)
  ├─ 401 ───────────────→ unconfigured (cofre e cache limpos)
  ├─ 403 ───────────────→ configured (mantém credencial, mostra erro)
  └─ remover ───────────→ unconfigured (cofre e cache limpos)
```

## Invariantes

1. O PAT em claro NUNCA existe no renderer, no cache, em logs ou em diagnóstico.
2. Existe no máximo uma `OrganizationConfig` ativa por instalação.
3. `Team.projectId` deve corresponder a um `Project.id` do snapshot.
4. `SessionContext.selectedTeamId` só é válido se pertencer ao projeto selecionado.
5. Remover a configuração apaga `CredentialRecord`, `CacheSnapshot` e a chave de
   criptografia do cache.
6. Um 403 não apaga a configuração; um 401 apaga a credencial.
7. `normalizedOrganization` é o único valor usado em URLs.

## Validações

| Campo | Validação | Mensagem/código |
|---|---|---|
| `organization` | obrigatório, 3–50 caracteres, letras/números/hífen | `CFG-001` |
| `pat` | obrigatório, sem espaços nas pontas, não vazio | `CFG-002` |
| PAT válido | `connectionData` responde 200 | `CFG-003` (401) |
| Permissão | `projects?$top=1` responde 200 | `CFG-004` (403) |
| Organização | 404 no `connectionData`/projetos | `CFG-009` (404) |
| Rate limit | 429 com `Retry-After` | `CFG-006` |
| Rede/timeout | erro de transporte | `CFG-005` |
| Servidor | 5xx | `CFG-007` |

## Persistência

| Dado | Local | Proteção |
|---|---|---|
| Organização, preferências, seleção | arquivo JSON atômico | Sem segredo |
| PAT cifrado | arquivo/blob no `userData` | `safeStorage` (DPAPI/Keychain/libsecret) |
| Chave do cache | `safeStorage` | Cofre do SO |
| Cache de projetos/times | arquivo no `userData` | AES-256-GCM |
| Logs | `userData/logs` | Redigidos, rotação curta |

## Migração

- `schemaVersion` em configuração e cache.
- Versão desconhecida ou cache corrompido: descartar cache, manter configuração e
  registrar `DATA-001`/`DATA-002`.
- Migrações devem ser versionadas e reversíveis; nenhuma migração destrutiva sem
  backup lógico.
