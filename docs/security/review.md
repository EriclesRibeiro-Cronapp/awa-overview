# Revisão de segurança — 2026-11-02

Escopo: feature 001 (configuração e conexão com Azure DevOps), aplicação
Electron 45, Windows, instância única, read-only.

## Checklist

| Controle | Evidência | Status |
|---|---|---|
| Sem autenticação própria (login/SSO/OAuth) | Fluxo usa apenas organização + PAT na modal | OK |
| Read-only no Azure DevOps | `AzureDevOpsClient` só expõe `validate`, `validateAccess`, `listProjects`, `listTeams`; teste de contrato verifica ausência de escrita | OK |
| PAT em cofre do SO | `safeStorage` (DPAPI/Keychain/libsecret); `CredentialsService` falha fechado | OK |
| PAT não retorna ao renderer | IPC devolve apenas `patLast4`; teste de contrato verifica ausência do valor | OK |
| PAT fora de logs/diagnóstico | `redactText`/`redactValue`; teste de diagnóstico verifica `[REDACTED_PAT]` | OK |
| Cache cifrado em repouso | AES-256-GCM; chave no `safeStorage`; teste de cache | OK |
| Remoção limpa PAT/cache/chave | `removeConfiguration`; teste de integração | OK |
| Renderer isolado | `contextIsolation=true`, `nodeIntegration=false`, `sandbox=true`; teste e2e | OK |
| CSP restritiva | `src/main/security/csp.ts`; sem conteúdo remoto | OK |
| Instância única | `app.requestSingleInstanceLock`; teste e2e | OK |
| HTTPS e validação de certificado | `fetch` nativo com URL `https://dev.azure.com` | OK |
| Sem escrita no cache/DB por terceiros | Arquivos no `userData`; cache autenticado (GCM) | OK |

## Riscos residuais

1. **Acesso ao cofre pelo usuário do SO**: malware com o mesmo usuário pode abrir o
   cofre. Mitigação: cofre do SO, sem texto plano e sem reexibição.
2. **PAT com escopos amplos**: a aplicação não consegue verificar escopos; orienta
   read-only no texto de ajuda. Risco aceito e documentado.
3. **Build não assinado**: assinatura e auto-update entram no primeiro release
   (ADR 0009).
4. **Somente Windows validado**: macOS/Linux exigem ADR e testes futuros.
5. **Snapshot visual local**: baseline gerado nesta máquina; pode variar em outra
   configuração de fontes/DPI.

## Próximos passos de segurança

- Adquirir certificado e configurar assinatura/notarização.
- Validar `safeStorage` em Windows 10 e 11 reais.
- Revisar escopos recomendados do PAT quando a integração de work items/PRs entrar.
- Avaliar alerta quando o PAT tiver escopos de escrita (se a API permitir).
