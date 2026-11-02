# Revisão de segurança — 2026-11-02

Escopo: features 001 (configuração e conexão), 002 (Overview), 003 (Work items) e
004 (Pull requests), aplicação Electron 45, Windows, instância única, read-only.

## Checklist

| Controle | Evidência | Status |
|---|---|---|
| Sem autenticação própria (login/SSO/OAuth) | Fluxo usa apenas organização + PAT na modal | OK |
| Read-only no Azure DevOps | GETs e WIQL somente leitura (ADR-0011); nenhum método de mutação | OK |
| PAT em cofre do SO | `safeStorage` (DPAPI/Keychain/libsecret); `CredentialsService` falha fechado | OK |
| PAT não retorna ao renderer | IPC devolve apenas `patLast4`; `overview:load` não recebe PAT | OK |
| PAT fora de logs/diagnóstico | `redactText`/`redactValue`; teste de diagnóstico verifica `[REDACTED_PAT]` | OK |
| Cache cifrado em repouso | AES-256-GCM; caches de projetos, Overview, Work items e Pull requests separados | OK |
| Remoção limpa PAT/cache/chave | `removeConfiguration`; teste de integração cobre também o cache do Overview | OK |
| Renderer isolado | `contextIsolation=true`, `nodeIntegration=false`, `sandbox=true`; teste e2e | OK |
| CSP restritiva | `src/main/security/csp.ts`; sem conteúdo remoto | OK |
| Instância única | `app.requestSingleInstanceLock`; teste e2e | OK |
| HTTPS e validação de certificado | `fetch` nativo com URL `https://dev.azure.com` | OK |
| Links externos restritos | `app:openExternal` aceita apenas HTTPS em `dev.azure.com`/`*.visualstudio.com`; teste de contrato | OK |
| Escopos insuficientes não confundem com token inválido | identidade válida + 401 nos endpoints de dados → `CFG-004` com orientação de escopos | OK |
| Sem escrita no cache/DB por terceiros | Arquivos no `userData`; cache autenticado (GCM) | OK |

## Riscos residuais

1. **Acesso ao cofre pelo usuário do SO**: malware com o mesmo usuário pode abrir o
   cofre. Mitigação: cofre do SO, sem texto plano e sem reexibição.
2. **PAT com escopos amplos ou insuficientes**: a aplicação não consegue verificar
   escopos antecipadamente. A UI orienta read-only e, quando a identidade é válida
   mas um endpoint retorna 401, exibe falta de permissão em vez de token inválido.
   Risco aceito e documentado.
3. **Build não assinado**: assinatura e auto-update entram no primeiro release
   (ADR 0009).
4. **Somente Windows validado**: macOS/Linux exigem ADR e testes futuros.
5. **Snapshot visual local**: baseline gerado nesta máquina; pode variar em outra
   configuração de fontes/DPI.

## Próximos passos de segurança

- Adquirir certificado e configurar assinatura/notarização.
- Validar `safeStorage` em Windows 10 e 11 reais.
- Revisar escopos recomendados do PAT: Project and Team (Read), Work Items (Read),
  Code (Read) e Build (Read). PRs exigem Code (Read).
- Avaliar alerta quando o PAT tiver escopos de escrita (se a API permitir).
