# ADR-0005: Integração com Azure DevOps

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0001, ADR-0010
- **Substitui:** —

## Contexto

A aplicação é read-only e precisa validar o PAT, listar projetos e obter times por
projeto. O Azure DevOps expõe REST com versões e limites próprios.

## Decisão

- Usar **REST** em `https://dev.azure.com/{organization}/_apis`.
- Fixar `api-version=7.1` (revisar 7.2 antes da implementação).
- Autenticar com `Authorization: Basic base64(":" + PAT)`; o token nunca vai na URL.
- Validar com `GET /connectionData` e `GET /projects?$top=1`.
- Listar projetos com `GET /projects?$top=100` e continuação.
- Listar times com `GET /projects/{projectId}/teams`.
- Paginação obrigatória; limite de páginas; respeito a `Retry-After`; timeout de
  15s; retry máximo de 3 em 429/5xx.
- Nenhum método de escrita no client.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| SDK oficial | Tipos e conveniência | Dependência grande e menos controle | REST + Zod é suficiente |
| GraphQL | Flexível | Não é o padrão do Azure DevOps | Fora de escopo |
| Escrita | Mais funcionalidades | Viola read-only | Proibido pela constituição |

## Consequências

### Positivas

- Contrato explícito e testável com fixtures.
- Isolamento da versão da API no client.

### Negativas e riscos

- Mudanças de API exigem atualização de versão e testes.
- Limites de taxa exigem cache e backoff.

## Conformidade constitucional

Atende aos Princípios II, VII e VIII; escopos read-only conforme Princípio VI.

## Links

- Contrato: `specs/001-configuracao-azure-devops/contracts/azure-devops.md`
- Pesquisa: `specs/001-configuracao-azure-devops/research.md`
