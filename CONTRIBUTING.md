# Como contribuir — AWA Overview

Este documento complementa a [constituição](.specify/memory/constitution.md) com o
fluxo operacional. Em caso de conflito, a constituição prevalece.

## Ciclo de desenvolvimento

1. `/speckit.specify` — especificação aprovada.
2. `/speckit.clarify` — reduzir ambiguidades, quando necessário.
3. `/speckit.plan` — plano técnico e ADRs necessárias.
4. `/speckit.tasks` — tarefas verificáveis.
5. `/speckit.implement` — implementação.

Nenhuma funcionalidade começa sem spec aprovada. Lacunas de design estão em
[`docs/design/gaps.md`](docs/design/gaps.md) e DEVEM ser resolvidas na spec.

## Branches e commits

- Branch: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`.
- Commits seguem Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`,
  `refactor:`, `chore:`.
- O corpo do commit referencia a spec/tarefa (ex.: `Refs: specs/001-overview`).
- Commits pequenos e com uma intenção.

## Pull requests

- PRs pequenos, com descrição do problema, solução e impacto.
- Todo PR referencia a spec/tarefa e as ADRs afetadas.
- Fluxo crítico exige revisão humana de outra pessoa quando houver mais de um
  contribuidor.
- O PR DEVE preencher o checklist abaixo.

### Checklist do PR

- [ ] Spec/tarefa referenciada.
- [ ] ADRs necessárias criadas/atualizadas.
- [ ] Testes exigidos passando.
- [ ] Lint/format/typecheck passando.
- [ ] Sem segredos em código, logs ou configuração.
- [ ] Tokens e componentes documentados usados.
- [ ] Fidelidade visual comparada com os screenshots.
- [ ] Acessibilidade AA verificada.
- [ ] Documentação e changelog atualizados.

## Verificação

| Princípio | Verificação |
|---|---|
| I e II | Teste de arquitetura (grafo de dependências) e revisão de imports |
| III | Formatador, linter, typecheck e revisão de código |
| IV | Inventário de componentes, uso de tokens e revisão visual |
| V | Comparação com screenshots e auditoria de acessibilidade |
| VI | Varredura de segredos, revisão de logs e teste de redaction |
| VII | Testes de erro e catálogo de códigos |
| VIII | Testes automatizados no CI |
| IX | Revisão de ADR no plano e no PR |
| X | Schema de log e teste de exportação de diagnóstico |

Nenhum merge com CI vermelho. Exceções DEVEM ser aprovadas e registradas.

**Bootstrap:** enquanto o CI não existir (ADR 0006 pendente), a verificação é
manual e registrada no PR. O CI DEVE existir antes do primeiro release.

## Definição de pronto

- Spec e ADRs necessárias aprovadas.
- Testes exigidos passando localmente e no CI.
- Fidelidade visual comparada com os screenshots.
- Acessibilidade AA verificada.
- Sem credenciais nem dados sensíveis em código, logs ou configuração.
- Tokens e componentes documentados usados.
- Dependências justificadas e auditadas.
- Documentação, changelog e ADRs atualizados.

## Desenvolvimento assistido por IA

- Arquivos gerados (`docs/design/_raw/`, `_state.json`, `tokens.css`,
  `tailwind.config.js`) NÃO DEVEM ser editados à mão.
- Em conflito entre análise manual e bloco `fe:auto`, prevalece a análise manual,
  considerando a data de extração.
- Toda mudança DEVE ser verificada com build/test/lint e revisão do diff.
- O agente NÃO DEVE presumir tecnologia ou padrão sem evidência ou ADR.
- Decisão pendente: parar e solicitar.
- Operações destrutivas exigem aprovação.
- Segredos e dados da organização NÃO DEVEM ser enviados a modelos de IA.
- Citar a fonte (arquivo/caminho) e marcar incerteza em vez de inventar.

## Releases

- Versionamento do aplicativo em **SemVer** (`MAJOR.MINOR.PATCH`).
- Canal inicial: `stable`; canais adicionais exigem decisão.
- Release notes com mudanças, correções e riscos conhecidos.
- Builds assinados; atualização com verificação de integridade e rollback.
- A versão da constituição e as ADRs vigentes são registradas no release.

## Papéis

- **Responsável do projeto:** aprova emendas, ADRs estruturais e exceções.
- **Revisor:** revisa fluxo crítico e PRs.
- A aprovação é registrada em spec, ADR ou PR; aprovação informal não conta.
