# Quickstart — Configuração e conexão com Azure DevOps

## Pré-requisitos

- Windows 10/11 x64.
- Node.js 24 e npm.
- PAT do Azure DevOps com escopos de leitura (Project/Team, Work Items, Code e
  Build, conforme o uso futuro).
- Permissão para listar projetos e times da organização.

## Instalação e execução

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

## Build

```bash
npm run build
npm run package
```

O instalador NSIS é gerado em `release/`. Assinatura e auto-update entram no
primeiro release (ADR 0009).

## Validação manual

1. **Primeira execução:** abrir a aplicação sem configuração e confirmar o estado
   de configuração obrigatória.
2. **Salvar válido:** informar organização e PAT válidos, salvar e confirmar:
   - PAT mascarado com os 4 últimos caracteres;
   - projetos carregados;
   - times do projeto selecionado carregados.
3. **Reabrir modal:** confirmar que o PAT não é exibido por inteiro.
4. **Erros:**
   - PAT inválido/expirado → 401/`CFG-003`; configuração não persistida;
   - organização inexistente → 404/`CFG-009`;
   - PAT sem permissão → 403/`CFG-004`; campos mantidos;
   - rate limit → 429/`CFG-006` com espera;
   - rede desligada → `CFG-005`.
5. **Offline:** com configuração válida, desligar a rede, reiniciar e confirmar
   dados em cache com indicador de desatualização.
6. **Remover configuração:** confirmar que o PAT desaparece do cofre, o cache é
   limpo e a aplicação volta ao estado inicial.
7. **Instância única:** abrir duas vezes e confirmar que a segunda foca a janela
   existente.
8. **Acessibilidade:** concluir o fluxo apenas com teclado e conferir foco visível,
   rótulos e anúncio de erros.

## Onde ficam os dados

| Dado | Local |
|---|---|
| Configuração | `%APPDATA%\AWA Overview\config.json` |
| PAT cifrado | blob no diretório de dados do app (cifrado pelo `safeStorage`) |
| Cache | `%APPDATA%\AWA Overview\cache\` (AES-256-GCM) |
| Logs | `%APPDATA%\AWA Overview\logs\` |
| Diagnóstico | exportado pelo usuário, sem PAT/cache integral |

## Reset local

1. Remover a configuração pela aplicação (caminho preferencial).
2. Se necessário, fechar o app e apagar o diretório de dados do app.
3. Reabrir e confirmar o estado `unconfigured`.

## Diagnóstico

- Exportar diagnóstico pela aplicação; o arquivo contém versão, SO, organização,
  estado das integrações e logs redigidos.
- Nunca inclui PAT, headers ou cache integral.
- Em caso de `safeStorage` indisponível, a aplicação falha fechada e orienta o
  usuário; não grava PAT em texto plano.

## Problemas comuns

| Sintoma | Verificação |
|---|---|
| 401 | PAT expirado/revogado; gerar novo token read-only |
| 403 | Escopos ou permissão insuficientes |
| 404 | Nome da organização incorreto |
| 429 | Aguardar e tentar novamente; reduzir refresh |
| Cache corrompido | Remover configuração e reconfigurar |
| Segunda instância não abre | Verificar lock de instância e logs |
