# ADR-0004: Persistência, cache e criptografia

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0010, ADR-0001
- **Substitui:** —

## Contexto

A configuração guarda organização e preferências; o PAT é um segredo; projetos e
times precisam de cache para uso offline. Nesta feature o volume é pequeno.

## Decisão

- **Configuração não sensível:** `electron-store` (organização, seleção, versão).
- **PAT:** blob cifrado pelo `safeStorage`, nunca em texto plano.
- **Cache:** arquivo JSON cifrado com **AES-256-GCM**; chave aleatória de 32 bytes
  no `safeStorage`; arquivo em `app.getPath('userData')`.
- **TTL:** configurável; padrão de 15 minutos para projetos/times.
- **Remoção:** apaga cache, chave e PAT.
- **SQLite/SQLCipher:** reavaliar quando work items, PRs e pipelines forem
  adicionados e o volume justificar.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não agora |
|---|---|---|---|
| SQLite puro | Consultas, escala | Sem criptografia nativa | Dados confidenciais |
| SQLCipher/better-sqlite3 | Criptografia e escala | Módulo nativo, rebuild, complexidade | Volume pequeno nesta feature |
| Cache só em memória | Simples | Sem offline | Requisito da spec |
| JSON em texto plano | Simples | Viola segurança | Inaceitável |

## Consequências

### Positivas

- Simples, seguro e suficiente para o volume atual.
- Interface de cache permite trocar a implementação depois.

### Negativas e riscos

- JSON não escala para grandes volumes; a troca será necessária.
- Chave no cofre do SO: se o cofre falhar, o cache não é legível (falha fechada).

## Conformidade constitucional

Atende aos Princípios VI (dados sensíveis), VIII (testes de cache) e IX (ADR).

## Links

- Data model: `specs/001-configuracao-azure-devops/data-model.md`
- ADR-0010
