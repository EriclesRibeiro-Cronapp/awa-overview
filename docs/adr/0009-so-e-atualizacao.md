# ADR-0009: Sistemas operacionais, assinatura e atualização

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0002
- **Substitui:** —

## Contexto

O primeiro release precisa de alvo definido, distribuição confiável e caminho de
atualização. A aplicação é desktop e de instância única.

## Decisão

- **Primeiro release:** Windows 10/11 x64.
- **Instalador:** NSIS, com assinatura de código antes do release.
- **Atualização:** `electron-updater` com verificação de assinatura/integridade e
  rollback; canal `stable`.
- **macOS/Linux:** fora do primeiro release; exigem ADR futura.
- **CI de release:** build assinado, artefato versionado e release notes.
- **Versionamento do app:** SemVer.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não agora |
|---|---|---|---|
| Multi-SO no primeiro release | Alcance | Custo de teste e assinatura | Foco em Windows |
| Atualização manual | Simples | Usuário fica desatualizado | Risco de segurança |
| Sem assinatura | Rápido | Alertas e risco de adulteração | Inaceitável no release |

## Consequências

### Positivas

- Alvo claro e caminho seguro de distribuição.
- Atualização verificada e reversível.

### Negativas e riscos

- Certificado de assinatura tem custo e processo.
- macOS exige notarização futura.

## Conformidade constitucional

Atende aos requisitos de aplicação desktop da constituição e ao Princípio IX.

## Links

- Plano: `specs/001-configuracao-azure-devops/plan.md`
- ADR-0002
