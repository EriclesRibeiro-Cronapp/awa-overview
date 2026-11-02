# ADR-0001: Stack — Electron 42 + TypeScript + React 19

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0002, ADR-0006, ADR-0010
- **Substitui:** —

## Contexto

Aplicação desktop, read-only, com forte fidelidade ao design documentado, time
TypeScript/React e necessidade de cofre do sistema operacional, instância única e
distribuição futura para Windows.

## Decisão

Usar **Electron 42** (linha estável atual), **Node.js 24** embutido,
**TypeScript 5.x**, **React 19** e **electron-vite** para build. O processo
principal concentra credenciais, API e cache; o preload expõe IPC mínimo; o
renderer não tem acesso a Node.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Tauri 2 | Binário/memória menores, núcleo Rust, capabilities | Exige camada Rust; WebView varia por SO; ecossistema menor | Time TS/React; fidelidade e suporte pesam mais |
| Nativo | Melhor integração | Custo e prazo | Inviável para o time |

## Consequências

### Positivas

- Renderização consistente (Chromium embutido) e fidelidade ao Figma.
- Ecossistema maduro para cofre, assinatura, atualização e testes.
- Time permanece em TypeScript/React.

### Negativas e riscos

- Binário e memória maiores que Tauri.
- Superfície de segurança maior; mitigada por `contextIsolation`, sandbox, CSP e
  renderer sem Node.

## Conformidade constitucional

Atende aos Princípios I, II, IV, V, VI e VIII. A separação main/preload/renderer é
um limite lógico compatível com monólito modular.

## Links

- Spec: `specs/001-configuracao-azure-devops/spec.md`
- Plano: `specs/001-configuracao-azure-devops/plan.md`
- Pesquisa: `specs/001-configuracao-azure-devops/research.md`
