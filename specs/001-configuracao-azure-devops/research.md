# Research — Configuração e conexão com Azure DevOps

## Decisão 1: Electron 45 + TypeScript + React 19

**Contexto:** aplicação desktop, read-only, com forte fidelidade visual ao Figma,
time TS/React, uma organização e PAT.

**Decisão:** Electron 45 (linha estável atual), Node 24 embutido, TypeScript 5.x,
React 19 e electron-vite.

**Alternativas:**

| Alternativa | Prós | Contras | Motivo da rejeição |
|---|---|---|---|
| Tauri 2 | Binário e memória menores; núcleo Rust; capabilities | Exige camada Rust; WebView varia por SO; ecossistema menor | Time é TS/React; fidelidade visual e suporte pesam mais |
| Aplicação nativa | Melhor integração | Custo e prazo inviáveis para o time | Fora do perfil do projeto |

**Consequências:** Chromium consistente entre SOs (fidelidade), ecossistema maduro
e tooling de assinatura/atualização; custo de binário e memória maiores.

**ADR:** 0001.

## Decisão 2: PAT no `safeStorage`

**Contexto:** o PAT é o único segredo e não há autenticação própria.

**Decisão:** cifrar o PAT com `safeStorage` do Electron (DPAPI no Windows,
Keychain no macOS, libsecret no Linux) e persistir apenas o blob cifrado. A
configuração guarda organização, preferências e a máscara (4 últimos caracteres).
Se `safeStorage` não estiver disponível, a aplicação falha fechada: não salva o PAT
em texto plano.

**Alternativas:** arquivo cifrado com senha (pior UX), keytar (manutenção
irregular), armazenar apenas em memória (perde a configuração ao fechar).

**Consequências:** o renderer nunca recebe o PAT salvo; o main descriptografa
somente durante a chamada. O risco residual é o acesso ao cofre pelo próprio
usuário do SO.

**ADR:** 0010.

## Decisão 3: Cache JSON cifrado nesta feature

**Contexto:** projetos e times são poucos e pequenos; work items/PRs/pipelines
virão depois.

**Decisão:** cache em arquivo JSON cifrado com AES-256-GCM; chave aleatória de 32
bytes guardada no `safeStorage`. O arquivo fica em `app.getPath('userData')`, tem
versão de schema e TTL. Remover a configuração apaga o cache e a chave.

**Alternativas:** SQLite puro (sem criptografia), SQLCipher/`better-sqlite3`
(complexidade nativa e rebuild), cache apenas em memória (sem offline).

**Consequências:** simplicidade e segurança para o volume atual. SQLite/SQLCipher
será reavaliado quando o volume justificar; a interface de cache isola a troca.

**ADR:** 0004.

## Decisão 4: Azure DevOps REST 7.1

**Contexto:** leitura de organização, projetos, times e, futuramente, work items,
PRs e pipelines.

**Decisão:**

- Base: `https://dev.azure.com/{organization}/_apis`.
- Autenticação: `Authorization: Basic base64(":" + PAT)` no header, nunca na URL.
- Versão fixada: `api-version=7.1` (revisar 7.2 antes de implementar).
- Validação: `GET /connectionData` (identidade) + `GET /projects?$top=1`
  (permissão de leitura).
- Projetos: `GET /projects?api-version=7.1&$top=100`, com continuação.
- Times: `GET /projects/{projectId}/teams?api-version=7.1`.
- Paginação obrigatória; `Retry-After` respeitado; timeout e backoff exponencial.
- Nenhum método de escrita no client.

**Consequências:** contrato simples e testável; a versão da API fica isolada no
client. Mudanças de API exigem atualização de versão e testes de contrato.

**ADR:** 0005.

## Decisão 5: Testes

**Decisão:**

- **Unidade/integração:** Vitest + React Testing Library.
- **HTTP:** MSW com fixtures gravadas; nenhum teste depende da API real.
- **E2E:** Playwright com `_electron.launch`.
- **Acessibilidade:** `@axe-core/playwright` nas telas/fluxos.
- **Cobertura:** mínima de 80% para `src/main/services` e `src/shared`; fluxos
  críticos com teste de integração dedicado.

**Alternativas:** Jest (mais lento no cenário Vite), Cypress (menos suporte a
Electron), testes manuais (não atendem ao Princípio VIII).

**ADR:** 0006.

## Decisão 6: Empacotamento, CI e SO

**Decisão:**

- **Build:** electron-vite + electron-builder.
- **Instalador:** NSIS no Windows.
- **CI:** GitHub Actions em `windows-latest`; lint, typecheck, testes, build.
- **SO inicial:** Windows 10/11 x64. macOS/Linux exigem ADR futura.
- **Assinatura/atualização:** adiadas para o primeiro release; `electron-updater`
  com verificação de assinatura e rollback será configurado no ADR 0009.

**ADR:** 0002 e 0009.

## Decisão 7: Segurança de processo

**Decisão:**

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`.
- CSP restritiva; navegação externa bloqueada; `setWindowOpenHandler` negado.
- IPC tipado e mínimo; o renderer nunca recebe PAT.
- Instância única com `app.requestSingleInstanceLock()`.
- Logs com redaction central; PAT, headers e query strings nunca registrados.

**ADR:** 0001 e 0010; modelo de ameaças em `docs/security/threat-model.md`.

## Pendências que não bloqueiam esta feature

| Pendência | Quando resolver |
|---|---|
| Certificado de assinatura de código | Antes do primeiro release (ADR 0009) |
| Canal de atualização e rollback | Antes do primeiro release (ADR 0009) |
| Suporte a macOS/Linux | Após o release Windows (ADR 0009) |
| SQLite/SQLCipher | Quando o volume de dados crescer (ADR 0004) |
| Migração para API 7.2 | Quando a versão 7.1 for depreciada (ADR 0005) |

Nenhum `NEEDS CLARIFICATION` permanece para o escopo desta feature.
