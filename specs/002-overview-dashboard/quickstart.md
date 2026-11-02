# Quickstart — Tela Overview

## Pré-requisitos

- Feature 001 configurada com organização e PAT read-only válidos.
- PAT com escopos **Project and Team (Read)**, **Work Items (Read)**, **Code (Read)**
  e **Build (Read)**. Sem Work Items/Build, os cards correspondentes exibem falta de
  permissão (`CFG-004`) e o card de PR continua funcionando.
- Projeto e time selecionados (o time é opcional).

## Executar

```powershell
npm install
npm run dev
```

## Validação manual

1. Abrir o app com configuração válida.
2. Confirmar o shell: cabeçalho, seletor de projeto, seletor de time, abas e rodapé.
3. Confirmar **Overview** ativa e as demais abas visíveis, porém indisponíveis.
4. Com work items atribuídos, confirmar até 3 itens, ordenados por alteração recente,
   com tipo, ID, título, status, projeto, responsável e link.
5. Sem work items, confirmar a mensagem
   `No work items are assigned to you in this view.`
6. Com PR aguardando revisão, confirmar ID, título, data, projeto, status e link.
7. Sem PR, confirmar `No open pull requests need your attention.`
8. Com pipeline recente, confirmar status, nome, data, projeto e link.
9. Sem pipeline, confirmar
   `No recent pipeline runs were found for your projects.`
10. Acionar **Atualizar** e verificar a mudança do horário e dos dados.
11. Fechar e reabrir: o cache deve entregar conteúdo imediatamente; após 5 minutos,
    o conteúdo antigo pode aparecer com indicação de desatualizado.
12. Desligar a rede e reabrir: os cards devem exibir cache com aviso, sem tela branca.
13. Trocar o projeto/time: os três cards devem recarregar no novo contexto.
14. Abrir cada link e confirmar que a página correta abre no navegador padrão.
15. Navegar apenas por teclado e conferir foco visível, abas e leitores de tela.

## Testes automatizados

```powershell
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

### Fixtures e e2e

- Os testes de unidade usam `fetch` fake com respostas de WIQL, PRs e builds.
- Os testes de contrato usam `ipcMain` mockado e serviços falsos.
- Os e2e usam `--user-data-dir` isolado e sobrescrevem `overview:load` para
  resultados determinísticos.
- O caminho feliz contra o Azure DevOps real usa:
  - `AWA_E2E_ORG`
  - `AWA_E2E_PAT`
  - `AWA_E2E_PROJECT`

## Critérios de aceite

- [ ] Shell e três cards fiéis ao design documentado.
- [ ] Estados vazio, carregando, erro e stale por card.
- [ ] Atualização manual e cache de 5 minutos.
- [ ] Links abrem somente no Azure DevOps.
- [ ] Nenhum PAT exposto.
- [ ] WCAG 2.2 AA e navegação por teclado.
- [ ] Suíte da feature 001 sem regressões.

## Status de validação (2026-11-02)

| Verificação | Resultado |
|---|---|
| `npm run lint` | OK |
| `npm run typecheck` | OK |
| `npm test` | 94 testes |
| `npm run build` | OK |
| `npm run test:e2e` | 15 passaram · 1 skip (caminho feliz real exige PAT com escopos) |
| Axe no Overview | sem violações |
| Snapshot visual | baseline `overview-filled.png` |
| PAT sem Work Items/Build | cards Work items/Pipelines com `CFG-004`; PR carrega |

