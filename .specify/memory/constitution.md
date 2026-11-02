<!--
Sync Impact Report
==================
Version change: (nenhuma) -> 1.0.0
Bump rationale: adoção inicial da constituição, com 10 princípios e governança.
Modified principles: N/A (documento inicial).
Added sections: Princípios Fundamentais (I–X), Restrições Adicionais,
  Fluxo de Desenvolvimento e Qualidade, Governança.
Removed sections: nenhuma.
Templates: não alterados (leem a constituição em tempo de execução).
Deferred TODOs: nenhum placeholder pendente. Decisões técnicas ainda não
  tomadas estão listadas em "Decisões Técnicas Pendentes" e devem ser
  registradas em ADR antes da implementação correspondente.
Ratification: assumida como 2026-11-02 (data desta adoção inicial).
-->

# Constituição do AWA Overview

## Propósito

O AWA Overview é uma aplicação desktop que centraliza informações do Azure DevOps
em uma única interface. Esta constituição estabelece os princípios técnicos e
arquiteturais que orientam todo o ciclo de desenvolvimento.

As telas, componentes, tokens, ícones e referências visuais extraídos do Figma são
fontes oficiais para a implementação da interface. Nenhum princípio abaixo presume
tecnologia, framework ou padrão arquitetural ainda não decidido; essas escolhas
devem ser registradas conforme a seção de governança.

## Princípios Fundamentais

### I. Arquitetura Modular e Extensível

- A aplicação DEVE ser organizada em módulos com fronteiras explícitas,
  responsabilidade única e contrato público documentado.
- Cada módulo DEVE poder ser compreendido e testado de forma isolada.
- Novos recursos do Azure DevOps (work items, pull requests, pipelines, projetos)
  DEVEM ser adicionáveis por extensão, sem reescrever módulos existentes.
- Dependências entre módulos DEVEM ser explícitas e justificadas; dependências
  circulares são proibidas.
- Acoplamento com detalhes de infraestrutura DEVE ficar restrito às camadas de
  integração e persistência.

**Rationale:** o produto cresce por acréscimo de fontes e visões do Azure DevOps;
uma arquitetura modular evita que cada nova visão exija refatorações amplas.

### II. Separação de Camadas

- A aplicação DEVE separar, no mínimo: apresentação, regras de negócio/aplicação,
  integração com o Azure DevOps e persistência local.
- A camada de apresentação NÃO DEVE conter regras de negócio nem chamar a API do
  Azure DevOps diretamente.
- A camada de integração NÃO DEVE depender de componentes de interface.
- A persistência DEVE ser acessada por abstrações (repositórios ou serviços) e não
  por detalhes de armazenamento espalhados pelo código.
- Os contratos entre camadas DEVEM ser explícitos e cobertos por testes quando
  representarem regras de negócio.

**Rationale:** separar responsabilidades permite testar regras sem interface,
trocar a forma de persistência e evoluir integrações sem afetar a UI.

### III. Código Legível e Reutilizável

- O código DEVE seguir uma convenção única de nomenclatura e organização, usando a
  linguagem do domínio (work item, pull request, pipeline, projeto).
- Funções, componentes e módulos DEVEM ter responsabilidade coesa e tamanho que
  permita leitura e teste sem esforço desproporcional.
- Lógica duplicada é proibida; ao identificar uma regra compartilhada, ela DEVE ser
  extraída para um único ponto reutilizável.
- Complexidade acidental DEVE ser justificada; a solução mais simples que atende à
  especificação DEVE ser preferida.
- Código morto, experimental ou comentado NÃO DEVE permanecer no repositório.

**Rationale:** legibilidade e reutilização reduzem o custo de manutenção e o risco
de divergência entre telas que exibem a mesma informação.

### IV. Componentização Consistente da Interface

- A interface DEVE ser construída a partir dos componentes documentados (Tab, Tag,
  Card, tabela, modal e ícones) antes de criar novos.
- Um componente novo DEVE ter propósito claro, estados documentados, propriedades
  definidas e referência visual no Figma.
- Valores visuais DEVEM usar os design tokens documentados; cores, espaçamentos,
  raios e tipografia hardcoded exigem justificativa registrada.
- Estados documentados (default, hover, selected, disabled, vazio) DEVEM ser
  implementados. Estados não documentados exigem aprovação antes da implementação.
- Componentes semelhantes NÃO DEVEM ser duplicados sem justificativa técnica ou
  visual registrada.

**Rationale:** a consistência visual e comportamental depende de um conjunto único
de componentes reutilizáveis, não de implementações paralelas.

### V. Fidelidade Visual ao Design System

- `docs/design/` é a fonte oficial de verdade para telas, medidas, cores,
  tipografia, espaçamentos, componentes, ícones e estados.
- A implementação DEVE corresponder às medidas, cores, tipografia e espaçamentos
  documentados.
- Desvios visuais DEVEM ser explicitamente aprovados e registrados na especificação
  ou em ADR, com impacto e justificativa.
- Comportamentos visuais não documentados NÃO DEVEM ser inventados.
- Os SVGs exportados em `docs/design/assets/icons/` DEVEM ser usados como estão;
  redesenhar ícones é proibido sem aprovação.
- A implementação DEVE ser comparada com os screenshots de referência antes de ser
  considerada concluída.

**Rationale:** o design já foi validado no Figma; divergências não intencionais
quebram a fidelidade e introduzem decisões visuais não acordadas.

### VI. Segurança no Armazenamento e Uso de Credenciais

- Tokens e credenciais do Azure DevOps NÃO DEVEM ser commitados, registrados em
  logs, exibidos na interface ou gravados em texto plano.
- O armazenamento DEVE usar um mecanismo seguro do sistema operacional ou solução
  equivalente aprovada, acessado por um serviço dedicado.
- Logs e mensagens de erro DEVEM redigir credenciais e dados sensíveis.
- As credenciais DEVEM ter o menor escopo possível e suportar rotação e revogação.
- O fluxo de autenticação (PAT, OAuth ou outro) DEVE ser decidido e documentado
  antes da implementação.

**Rationale:** a aplicação acessa contas externas; vazamento de credenciais expõe
o usuário e a organização.

### VII. Tratamento Consistente de Erros

- A aplicação DEVE adotar uma taxonomia única de erros: validação, autenticação,
  autorização, rede/timeout, limite de requisições, erro do servidor e inesperado.
- A interface DEVE apresentar mensagens acionáveis ao usuário, sem stack traces ou
  detalhes sensíveis.
- Integrações DEVEM definir timeout e política de retry com backoff; retry infinito
  é proibido.
- Erros NÃO DEVEM ser silenciados; DEVEM ser registrados com contexto suficiente
  para diagnóstico.
- Falhas parciais DEVEM ser tratadas explicitamente (por exemplo, uma fonte do
  Azure DevOps indisponível sem derrubar as demais).

**Rationale:** falhas de comunicação são esperadas em integrações externas e
precisam de comportamento previsível para o usuário e para o suporte.

### VIII. Testes Automatizados

- Regras de negócio e fluxos críticos DEVEM ter testes automatizados.
- São considerados críticos: configuração e autenticação, mapeamento de dados do
  Azure DevOps, tratamento de erros e persistência/cache.
- Componentes de interface DEVERIAM ter testes dos estados documentados.
- Testes DEVEM ser determinísticos e executáveis localmente e em integração
  contínua; a ferramenta e o pipeline serão definidos em ADR.
- Uma funcionalidade NÃO DEVE ser considerada concluída sem os testes exigidos por
  este princípio.

**Rationale:** os dados exibidos vêm de uma API externa e mudam com frequência;
testes automatizados protegem contra regressões silenciosas.

### IX. Documentação das Decisões Arquiteturais

- Decisões arquiteturais relevantes DEVEM ser registradas em ADRs, contendo
  contexto, decisão, alternativas consideradas e consequências.
- DEVEM ser registradas, no mínimo: stack e framework, arquitetura, persistência,
  autenticação, política de erros, observabilidade e empacotamento/distribuição.
- As ADRs DEVEM permanecer no repositório e ser atualizadas quando a decisão mudar.
- Decisões não registradas NÃO DEVEM ser tratadas como acordadas.

**Rationale:** sem registro, decisões implícitas se perdem e passam a ser
reinterpretadas de formas diferentes por cada contribuidor.

### X. Observabilidade e Diagnóstico

- A aplicação DEVE produzir logs estruturados, com nível e contexto suficientes para
  rastrear uma falha da interface até a integração ou persistência.
- Logs NÃO DEVEM conter credenciais, tokens ou dados sensíveis.
- O estado das integrações e da persistência local DEVE ser diagnosticável sem
  necessidade de debugger.
- Métricas, telemetria e tracing são decisões pendentes; qualquer coleta DEVE ser
  documentada e, quando envolver dados do usuário, opt-in.

**Rationale:** em uma aplicação desktop, o suporte depende de evidências locais;
logs úteis e seguros encurtam o diagnóstico.

## Restrições Adicionais

### Fontes Oficiais de Design

- `docs/design/README.md` descreve escopo, cobertura e lacunas.
- `docs/design/foundations.md`, `tokens.md`, `components.md`, `screens.md`,
  `assets.md` e `behavior.md` são as referências de implementação.
- `docs/design/tokens.css` e `docs/design/tailwind.config.js` são os artefatos de
  tokenização; nomes inferidos devem ser confirmados antes de virarem contrato.
- `docs/design/assets/icons/` contém os SVGs oficiais; `assets/screens/` contém as
  referências visuais.
- `docs/design/_raw/` é evidência gerada, não fonte editorial; em conflito, prevalece
  o documento analisado.

### Decisões Técnicas Pendentes

As decisões abaixo NÃO foram tomadas e NÃO DEVEM ser presumidas por esta
constituição. Cada uma exige ADR antes da implementação correspondente:

1. Stack de interface e linguagem (por exemplo, web/React, desktop nativo ou híbrido).
2. Runtime e empacotamento da aplicação desktop.
3. Gerenciamento de estado e navegação.
4. Persistência local (formato, local, criptografia e migração).
5. Fluxo de autenticação no Azure DevOps (PAT, OAuth ou Entra ID) e escopos.
6. Versão da API do Azure DevOps, paginação e política de rate limit.
7. Estratégia de cache, atualização e comportamento offline.
8. Ferramenta de testes, cobertura mínima e pipeline de integração contínua.
9. Logs, métricas, telemetria e política de retenção.
10. Idiomas suportados (i18n), acessibilidade e metas de compatibilidade.
11. Mecanismo de atualização da aplicação e sistemas operacionais suportados.

### Gestão de Dependências

- Toda dependência nova DEVE ser justificada no plano ou em ADR, com necessidade,
  manutenção, licença, segurança e impacto no tamanho da aplicação.
- APIs e recursos da plataforma DEVEM ser preferidos a bibliotecas que apenas
  reproduzam funcionalidade nativa.
- Dependências sem manutenção ativa ou com vulnerabilidades conhecidas NÃO DEVEM ser
  adicionadas.

## Fluxo de Desenvolvimento e Qualidade

### Ciclo Spec-Driven

1. `/speckit.specify` — especificação aprovada da funcionalidade.
2. `/speckit.clarify` — redução de ambiguidades, quando necessário.
3. `/speckit.plan` — plano técnico com verificação de conformidade constitucional.
4. `/speckit.tasks` — decomposição em tarefas verificáveis.
5. `/speckit.implement` — implementação somente após as etapas anteriores.

Nenhuma funcionalidade DEVE ser implementada sem especificação aprovada.

### Portões de Qualidade

Antes de considerar uma entrega concluída, DEVE ser verificado:

- conformidade com os princípios desta constituição;
- fidelidade às fontes oficiais de design;
- testes exigidos pelo Princípio VIII executando com sucesso;
- ausência de credenciais em código, logs ou configuração versionada;
- uso de tokens e componentes documentados;
- dependências justificadas;
- documentação e ADRs atualizados.

### Diretrizes para o Agente

- Antes de propor solução que dependa de decisão pendente, o agente DEVE identificar
  a pendência e solicitar a decisão.
- O agente NÃO DEVE presumir tecnologia, framework ou padrão arquitetural sem
  evidência no repositório ou decisão registrada.
- Toda proposta DEVE explicar a decisão e seus impactos.
- O agente DEVE preferir a solução mais simples que atenda à especificação.
- O agente NÃO DEVE criar código, funcionalidade ou comportamento visual fora do
  escopo aprovado.

## Governança

### Autoridade

Esta constituição prevalece sobre práticas, convenções e preferências individuais.
Em caso de conflito, a constituição DEVE ser seguida ou emendada formalmente.

### Emendas

Uma emenda DEVE conter: motivação, princípios ou seções afetadas, impacto esperado
e plano de migração quando houver mudança de comportamento. A emenda DEVE ser
aprovada pelo responsável do projeto e registrada com a nova versão.

### Versionamento

- MAJOR: remoção ou redefinição incompatível de princípio ou regra de governança.
- MINOR: novo princípio, nova seção ou expansão material de orientação.
- PATCH: esclarecimentos, correções de redação e refinamentos não semânticos.

### Conformidade

- Toda especificação, plano, tarefa e revisão DEVE verificar conformidade com esta
  constituição.
- Violações DEVEM ser justificadas, registradas e aprovadas, ou removidas.
- A constituição DEVE ser revisada sempre que uma decisão pendente for resolvida e,
  no mínimo, a cada ciclo de release.

**Version**: 1.0.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
