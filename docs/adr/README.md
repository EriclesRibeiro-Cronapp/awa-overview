# ADRs — AWA Overview

Registro das decisões arquiteturais do projeto. Uma decisão só é considerada
acordada quando existe uma ADR aprovada neste diretório.

## Status

| Status | Significado |
|---|---|
| Proposto | Em análise; não vale como decisão. |
| Aceito | Aprovado pelo responsável do projeto. |
| Substituído | Mantido para histórico; a decisão vigente está em outra ADR. |
| Rejeitado | Avaliado e descartado; o motivo fica registrado. |

## Índice

Decisões previstas. O arquivo `NNNN-titulo.md` é criado quando a decisão entra em
análise; até lá, o item permanece como proposta.

| ADR | Decisão | Status | Bloqueia |
|---|---|---|---|
| [0001](0001-stack-e-linguagem.md) | Stack e linguagem | Aceito | Primeira implementação |
| [0002](0002-runtime-e-empacotamento.md) | Runtime e empacotamento desktop | Aceito | Primeira implementação |
| 0003 | Estado e navegação | Proposto | Primeira tela |
| [0004](0004-persistencia-cache-offline.md) | Persistência, cache e offline | Aceito | Primeira integração |
| [0005](0005-integracao-azure-devops.md) | API, paginação e rate limit | Aceito | Integração |
| [0006](0006-testes-ci.md) | Testes, cobertura e CI | Aceito | Primeira entrega |
| 0007 | Logs, métricas e telemetria | Proposto | Primeiro release |
| 0008 | Idiomas e acessibilidade | Proposto | Primeiro release |
| [0009](0009-so-e-atualizacao.md) | Sistemas operacionais e atualização | Aceito | Empacotamento |
| [0010](0010-armazenamento-pat.md) | Armazenamento seguro do PAT | Aceito | Configuração |

## Como criar uma ADR

1. Copie [`0000-template.md`](0000-template.md) para `NNNN-titulo-em-kebab-case.md`.
2. Preencha contexto, decisão, alternativas e consequências.
3. Abra a discussão e registre a aprovação do responsável do projeto.
4. Atualize o índice e o status.
5. Se a decisão substituir outra, marque a anterior como **Substituído** e aponte
   para a nova.

ADRs não são apagadas: decisões antigas permanecem para preservar o histórico.
