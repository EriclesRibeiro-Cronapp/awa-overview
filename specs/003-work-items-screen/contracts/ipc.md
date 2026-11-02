# Contrato IPC — Work items

## Canal

`workItems:load`

### Entrada

```ts
interface WorkItemsLoadInput {
  force?: boolean;
}
```

O renderer não envia organização, PAT, projeto ou time; o main resolve pela
configuração e seleção persistida.

### Saída

```ts
type WorkItemsLoadResult =
  | { ok: true; data: WorkItemsView }
  | { ok: false; error: AppError };
```

`WorkItemsView` e `WorkItemTableRow` estão em [data-model.md](../data-model.md).

## Regras

- Sem projeto selecionado: `ok: true`, `context: null`, `items: []`,
  `summary` zerado, `fetchedAt: null`.
- Sem configuração/PAT: `ok: false` com `CFG-001`/`CFG-002`.
- `force=true` ignora cache fresco; em falha com cache, devolve `stale=true`.
- O main não devolve PAT, headers ou URLs internas da API.
- Erros usam `shared/errors.ts`; detalhes técnicos só nos logs redigidos.
- Resposta aditiva à API existente; nenhum canal antigo muda.

## Testes de contrato

- Sem projeto → contexto nulo e resumo zerado.
- Projeto/team → nomes resolvidos e `force` repassado.
- Cache fresco → não chama o cliente.
- Falha de rede com cache → `stale=true`.
- Nenhuma resposta contém PAT.
