# ADR-0002: Runtime e empacotamento desktop

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0001, ADR-0009
- **Substitui:** —

## Contexto

A aplicação é desktop e precisa de instalador reproduzível, build em CI e caminho
claro para assinatura e atualização.

## Decisão

- Build com **electron-vite**.
- Empacotamento com **electron-builder**.
- Instalador **NSIS** para Windows x64.
- Código organizado em `main`, `preload`, `renderer` e `shared`.
- Assinatura de código e `electron-updater` ficam para o primeiro release
  (ADR-0009); nesta feature o build é não assinado e local.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| electron-forge | Integração oficial | Menos flexível para NSIS/updater customizado | electron-builder atende melhor |
| Tauri bundler | Leve | Stack diferente | ADR-0001 |
| Distribuição só com `npm run dev` | Simples | Não é produto desktop | Fora de escopo |

## Consequências

### Positivas

- Pipeline único para dev, build e release.
- Caminho conhecido para assinatura/atualização.

### Negativas e riscos

- electron-builder adiciona configuração e tempo de build.
- Sem assinatura, o Windows pode alertar sobre o instalador até o release.

## Conformidade constitucional

Atende ao Princípio IX (decisão registrada) e prepara o Princípio X (diagnóstico e
distribuição). Assinatura e rollback são requisitos do primeiro release.

## Links

- Plano: `specs/001-configuracao-azure-devops/plan.md`
- ADR-0009
