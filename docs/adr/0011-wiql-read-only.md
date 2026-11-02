# ADR-0011: Consultas somente leitura com WIQL

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0005, spec 002
- **Substitui:** —

## Contexto

A tela Overview precisa descobrir work items atribuídos ao usuário e ao time
selecionado. A API REST do Azure DevOps não oferece um `GET` equivalente para
consultas ad-hoc de work items; o recurso disponível é o WIQL, que usa `POST` para
enviar a consulta. A constituição exige que a aplicação seja read-only, e o contrato
da feature 001 proibia qualquer `POST`.

## Decisão

- Permitir **um único tipo de `POST`**: `POST /{project}/_apis/wit/wiql?api-version=7.1`,
  exclusivamente para enviar uma consulta WIQL de leitura.
- O corpo contém apenas a consulta e não altera nenhum recurso.
- O cliente não expõe métodos de criação, atualização ou exclusão.
- A consulta é limitada a IDs, escopo de projeto/time, `AssignedTo = @Me`, estados
  abertos e ordenação por `ChangedDate DESC`.
- Toda resposta passa pelo mesmo mapeamento de erros e redaction das demais
  chamadas.
- O contrato e os testes DEVEM verificar que nenhum outro método de escrita é
  usado.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| Exigir consulta salva no Azure DevOps | Sem `POST` | Usuário precisa criar e manter uma consulta; difícil configurar | Pior experiência e acoplamento manual |
| Listar todos os work items do projeto | Apenas `GET` | Volume alto, lento e pode falhar por limite | Não escala |
| SDK oficial | Abstrai WIQL | Dependência grande e ainda usa `POST` | Não elimina a exceção |
| Não entregar work items no Overview | Sem exceção | Perde o valor principal da tela | Não atende à spec |

## Consequências

### Positivas

- Entrega o caso de uso principal com uma consulta oficial e eficiente.
- Mantém a aplicação funcionalmente read-only: nenhum dado é alterado.
- A exceção fica explícita, testada e restrita a um endpoint.

### Negativas e riscos

- Auditorias que procuram qualquer `POST` precisam conhecer a exceção.
- A consulta WIQL pode variar entre processos (Agile/Scrum/CMMI); os estados
  concluídos são tratados por nome e podem exigir ajuste futuro.

### Impacto em migração ou operação

- Nenhuma migração de dados.
- Logs devem registrar apenas o contexto da consulta, nunca o PAT.

## Conformidade constitucional

Atende ao Princípio VI (credenciais fora do renderer) e ao caráter read-only. A
exceção ao contrato "sem POST" é registrada nesta ADR e limitada a consulta, sem
violar o Princípio II (integração isolada no adaptador).

## Links

- Spec: `specs/002-overview-dashboard/spec.md`
- Contrato: `specs/002-overview-dashboard/contracts/azure-devops.md`
- Pesquisa: `specs/002-overview-dashboard/research.md`
