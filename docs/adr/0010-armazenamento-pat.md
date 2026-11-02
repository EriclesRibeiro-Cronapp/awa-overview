# ADR-0010: Armazenamento seguro do PAT

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0004, ADR-0005, ADR-0001
- **Substitui:** —

## Contexto

Não há autenticação própria. O PAT é o único segredo e concede acesso de leitura à
organização. Ele precisa ser guardado sem texto plano, sem exposição na UI e sem
vazar em logs/diagnóstico.

## Decisão

- Cifrar o PAT com **`safeStorage`** do Electron:
  - Windows: DPAPI;
  - macOS: Keychain;
  - Linux: libsecret.
- Persistir apenas o **blob cifrado** em arquivo do app; a configuração guarda
  organização, preferências e `patLast4`.
- Validar o PAT antes de salvar; erro não persiste.
- O PAT **nunca retorna ao renderer**; o IPC devolve apenas a máscara.
- Falha fechada: se o `safeStorage` não estiver disponível, não salvar em texto
  plano e informar o usuário.
- Remover a configuração apaga o blob, a chave do cache e o cache.
- 401 limpa o PAT; 403 mantém a credencial.
- Nenhum PAT em logs, erros, URLs, crash reports, diagnóstico ou prompt de IA.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| keytar | Multi-SO | Manutenção irregular | `safeStorage` é nativo |
| Arquivo com senha | Independente | UX ruim e senha extra | Desnecessário |
| Só memória | Seguro em repouso | Perde config ao fechar | Requisito de persistência |
| Texto plano | Simples | Inaceitável | Viola a constituição |

## Consequências

### Positivas

- Segredo protegido pelo SO e fora do renderer.
- Remoção e rotação explícitas.

### Negativas e riscos

- Acesso ao cofre pelo usuário do SO é risco residual.
- `safeStorage` pode variar entre SOs; falha fechada cobre indisponibilidade.

## Conformidade constitucional

Atende ao Princípio VI e ao modelo de ameaças em `docs/security/threat-model.md`.

## Links

- Threat model: `docs/security/threat-model.md`
- Data model: `specs/001-configuracao-azure-devops/data-model.md`
