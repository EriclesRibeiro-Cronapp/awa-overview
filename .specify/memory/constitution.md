# Constituição do AWA Overview

## Propósito

O AWA Overview é uma aplicação **desktop**, **read-only** e de **instância única**
que centraliza informações do Azure DevOps em uma única interface. Ela **não possui
autenticação própria**: a identidade perante o Azure DevOps é representada por um
**PAT read-only** e pelo **nome da organização**, informados pelo usuário na modal
de configuração. A partir dessa configuração, a aplicação obtém a lista de projetos
e times da organização.

A interface documentada em `docs/design/` DEVE ser adotada como a interface oficial
do projeto. As telas, componentes, tokens, ícones e referências visuais extraídos do
Figma definem o resultado esperado; a implementação DEVE reproduzi-la, e redesenhar
telas, fluxos ou componentes não está no escopo.

Esta constituição não presume stack, framework, runtime ou padrão arquitetural ainda
não decidido. Requisitos de segurança, acessibilidade e qualidade são mandatórios e
não dependem da escolha de stack.

## Termos Normativos

| Termo | Significado |
|---|---|
| **DEVE / NÃO DEVE** | Obrigatório. A violação impede a conclusão da entrega e exige correção ou aprovação formal registrada. |
| **DEVERIA** | Recomendado. O desvio é permitido, mas DEVE ser justificado no plano, na spec ou no PR. |
| **PODE** | Opcional, sem exigência de justificativa. |
| **Aprovado** | Decisão registrada pelo responsável do projeto em spec, ADR ou PR. Aprovação informal não conta. |

Definições:

- **Módulo:** limite lógico de funcionalidade, com contrato público. PODE ser um
  diretório dentro de um monólito modular; não exige pacote ou processo separado.
- **Porta:** interface definida pela aplicação ou pelo domínio para uma necessidade
  externa. **Adaptador:** implementação de infraestrutura de uma porta.
- **ADR:** registro em `docs/adr/NNNN-titulo.md` com contexto, decisão, alternativas,
  consequências e status.
- **Arquivo gerado:** `docs/design/_raw/`, `_state.json`, `tokens.css`,
  `tailwind.config.js` e artefatos equivalentes. Não DEVE ser editado à mão.
- **Fluxo crítico:** configuração e credenciais, mapeamento de dados do Azure DevOps,
  tratamento de erros, persistência/cache e dados exibidos nas telas principais.
- **Lacuna de design:** comportamento necessário que não existe no Figma ou em
  `docs/design/`. DEVE ser resolvido na spec antes da implementação e registrado em
  [`docs/design/gaps.md`](docs/design/gaps.md).

## Princípios Fundamentais

### I. Arquitetura Modular e Extensível

- A aplicação DEVE ser organizada em módulos lógicos com responsabilidade única,
  fronteiras explícitas e contrato público documentado.
- Um módulo PODE viver em um monólito modular; separação física em pacotes ou
  processos não é exigida.
- Cada módulo DEVE poder ser compreendido e testado de forma isolada.
- Extensibilidade DEVE ser aplicada apenas onde existirem dois ou mais casos de uso
  reais. Abstração preventiva sem uso concreto é proibida.
- Quando o segundo caso real surgir, o contrato de extensão DEVE ser definido; até
  lá, a implementação direta é permitida.
- Dependências entre módulos DEVEM ser explícitas e justificadas; dependências
  circulares são proibidas.
- Detalhes de infraestrutura DEVEM ficar restritos aos adaptadores de integração e
  persistência.

**Rationale:** o produto cresce por acréscimo de visões do Azure DevOps. Extensão
guiada por casos reais evita tanto a rigidez quanto o over-engineering.

### II. Separação de Camadas e Direção de Dependência

- A aplicação DEVE separar, no mínimo: apresentação, aplicação/domínio, integração
  com o Azure DevOps e persistência local.
- A direção de dependência permitida é **apresentação → aplicação → domínio**.
  Integração e persistência implementam portas e NÃO DEVEM ser importadas pela
  apresentação ou pelo domínio.
- A camada de apresentação NÃO DEVE conter regras de negócio nem chamar a API do
  Azure DevOps diretamente.
- Adaptadores de integração e persistência DEVEM implementar portas definidas pela
  aplicação ou pelo domínio; o sentido inverso é proibido.
- Configuração, credenciais, logging e tratamento de erros DEVEM ser serviços
  transversais acessados por portas, e não espalhados pela interface.
- O cache DEVE ser um adaptador de persistência com política explícita de validade,
  invalidação e staleness.
- Um composition root único DEVE montar as dependências concretas.
- Os contratos entre camadas DEVEM ser explícitos e cobertos por testes quando
  representarem regras de negócio.

**Rationale:** sem direção de dependência, "separação de camadas" vira intenção e a
infraestrutura vaza para a UI. Portas e adaptadores tornam a regra verificável.

### III. Código Legível e Reutilizável

- O código DEVE seguir uma convenção única de nomenclatura e organização, usando a
  linguagem do domínio (work item, pull request, pipeline, projeto).
- Funções, componentes e módulos DEVEM ter responsabilidade coesa. Limites de
  complexidade e tamanho DEVEM ser verificados por lint quando a stack for definida.
- **Duplicação de conhecimento** (uma regra de negócio repetida) é proibida.
  Duplicação incidental DEVE ser avaliada caso a caso e não justifica abstração
  prematura.
- Complexidade acidental DEVE ser justificada; a solução mais simples que atende à
  especificação DEVE ser preferida.
- Código morto, experimental ou comentado NÃO DEVE permanecer no repositório.
- Formatador, linter e verificação de tipos DEVEM existir e rodar no CI após a
  definição da stack.

**Rationale:** legibilidade e reutilização reduzem o custo de manutenção sem cair na
abstração prematura que o Princípio I proíbe.

### IV. Componentização Consistente da Interface

- A interface DEVE ser construída a partir dos componentes documentados (Tab, Tag,
  tabela, modal e ícones) e dos padrões documentados (cards, cabeçalho, rodapé)
  antes de criar novos.
- Um componente novo DEVE ter propósito claro, estados documentados, propriedades
  definidas e referência visual no Figma.
- Valores visuais DEVEM usar os design tokens documentados; cores, espaçamentos,
  raios e tipografia hardcoded exigem justificativa registrada.
- Estados documentados (default, hover, selected, disabled, vazio) DEVEM ser
  implementados. Estados não documentados exigem aprovação antes da implementação.
- A troca de `fill` fixo por `currentColor` nos SVGs é permitida para suportar
  estados; a geometria do ícone NÃO DEVE ser alterada.
- Componentes semelhantes NÃO DEVEM ser duplicados sem justificativa técnica ou
  visual registrada.

**Rationale:** a consistência visual e comportamental depende de um conjunto único
de componentes reutilizáveis, não de implementações paralelas.

### V. Fidelidade Visual e Acessibilidade

- A interface documentada em `docs/design/` DEVE ser adotada como a interface
  oficial; a implementação DEVE reproduzi-la, não redesenhar telas, fluxos ou
  componentes.
- `docs/design/` é a fonte oficial de verdade para telas, medidas, cores,
  tipografia, espaçamentos, componentes, ícones e estados.
- A implementação DEVE corresponder às medidas, cores, tipografia e espaçamentos
  documentados.
- Desvios visuais DEVEM ser explicitamente aprovados e registrados na especificação
  ou em ADR, com impacto e justificativa.
- Comportamentos visuais não documentados NÃO DEVEM ser inventados. Lacunas DEVEM
  ser resolvidas na spec e registradas em `docs/design/gaps.md`.
- Os SVGs exportados DEVEM ser usados como estão, ressalvada a troca de `fill` por
  `currentColor`; redesenhar geometria é proibido sem aprovação.
- A implementação DEVE ser comparada com os screenshots de referência antes de ser
  considerada concluída.
- **Acessibilidade é portão obrigatório.** A interface DEVE atender ao mínimo
  **WCAG 2.2 AA** para contraste de texto, foco visível, navegação por teclado e
  alvos de interação. Correções de acessibilidade são obrigatórias e apenas
  registradas; não dependem de aprovação de desvio visual. Fidelidade não pode
  produzir uma interface inacessível.

**Rationale:** o design já foi validado no Figma, mas os documentos registram
contrastes abaixo de AA. A regra de acessibilidade resolve o conflito sem permitir
redesenho arbitrário.

### VI. Credenciais e Dados Sensíveis

- A aplicação NÃO DEVE implementar autenticação própria (login, SSO ou OAuth). A
  credencial é um **PAT read-only**, informado com o nome da organização na modal de
  configuração.
- O PAT NÃO DEVE ser commitado, registrado em logs, exibido na interface, enviado a
  modelos de IA ou gravado em texto plano.
- O PAT DEVE ser armazenado em cofre do sistema operacional — Windows Credential
  Manager/DPAPI, macOS Keychain ou libsecret. A configuração local guarda apenas o
  nome da organização e preferências não sensíveis.
- A entrada do PAT DEVE ser mascarada, sem corretor e sem autocomplete. Após salvar,
  a interface DEVE exibir apenas os 4 últimos caracteres e nunca permitir revelar ou
  copiar o valor completo.
- O PAT DEVE ser validado por chamada read-only antes de ser salvo; mensagens de erro
  NÃO DEVEM ecoar o valor.
- Os escopos DEVEM ser read-only (projetos/times, work items, código e builds).
  Escrita no Azure DevOps NÃO DEVE ser solicitada.
- Expiração ou 401 DEVEM solicitar um novo PAT e limpar o cofre. Um 403 DEVE manter
  a credencial e informar falta de permissão. Troca de organização ou remoção da
  configuração DEVEM limpar o cofre e o cache correspondente.
- Credenciais e **dados em cache** DEVEM ser classificados. Dados da organização
  DEVEM ter criptografia em repouso e política de retenção e limpeza.
- Logs, erros, crash reports e exportação de diagnóstico DEVEM redigir credenciais e
  dados sensíveis. A redaction DEVE ser central, não caso a caso.
- Toda comunicação DEVE usar HTTPS com validação de certificado.
- Dependências DEVEM usar lockfile e auditoria de vulnerabilidades.

**Rationale:** sem autenticação, o PAT é o único segredo e concentra todo o risco. A
proteção precisa ser explícita na UI, no armazenamento, nos logs e no cache.

### VII. Tratamento Consistente de Erros

- A aplicação DEVE adotar uma taxonomia única de erros: configuração, credencial,
  autorização, rede/timeout, limite de requisições, erro do servidor e inesperado.
- Cada erro DEVE ter código estável e mensagem acionável; a interface NÃO DEVE
  exibir stack traces ou detalhes sensíveis.
- Integrações DEVEM definir timeout, limite de tentativas e retry com backoff;
  retry infinito é proibido.
- Erros NÃO DEVEM ser silenciados; DEVEM ser registrados com contexto e código.
- Falhas parciais DEVEM ser tratadas por recurso: uma fonte do Azure DevOps
  indisponível não pode derrubar as demais.
- O catálogo de erros e o schema de log DEVEM seguir
  [`docs/observability/README.md`](docs/observability/README.md).

**Rationale:** falhas de configuração e de comunicação são esperadas e precisam de
comportamento previsível para o usuário e para o suporte.

### VIII. Testes Automatizados

- Regras de negócio e fluxos críticos DEVEM ter testes automatizados.
- A estratégia de testes — pirâmide, cobertura mínima, ferramentas e pipeline —
  DEVE ser definida em ADR antes da primeira funcionalidade.
- São críticos: configuração e PAT, listagem de projetos/times, mapeamento de dados
  do Azure DevOps, tratamento de erros, persistência/cache e dados exibidos nas
  telas principais.
- Testes DEVEM usar fakes ou fixtures gravadas; NÃO DEVEM depender da API real nem
  conter dados reais da organização.
- Telas entregues DEVEM ter testes visuais de regressão e verificação de
  acessibilidade.
- Testes DEVEM ser determinísticos e executar localmente e no CI.
- Fluxos com volume relevante DEVEM ter teste de performance.
- Correção de bug DEVE incluir teste que reproduz o defeito; funcionalidade nova
  DEVE incluir teste de aceitação.
- Uma funcionalidade NÃO DEVE ser considerada concluída sem os testes exigidos.

**Rationale:** os dados vêm de uma API externa e mudam com frequência; testes
determinísticos e isolados protegem contra regressões e vazamento de dados.

### IX. Documentação das Decisões Arquiteturais

- Decisões arquiteturais relevantes DEVEM ser registradas em ADR em `docs/adr/`,
  seguindo o template do diretório.
- DEVEM ser registradas, no mínimo: stack e framework, arquitetura, persistência,
  credenciais/PAT, política de erros, observabilidade, empacotamento e distribuição.
- ADRs DEVEM ser atualizadas quando a decisão mudar e marcadas como substituídas,
  não apagadas.
- Decisões não registradas NÃO DEVEM ser tratadas como acordadas.

**Rationale:** sem registro, decisões implícitas se perdem e passam a ser
reinterpretadas de formas diferentes por cada contribuidor.

### X. Observabilidade e Diagnóstico

- A aplicação DEVE produzir logs estruturados, com nível, código e contexto
  suficientes para rastrear uma falha da interface até a integração ou persistência.
- Logs NÃO DEVEM conter credenciais, tokens, dados pessoais ou conteúdo integral de
  work items/PRs.
- O estado das integrações, da configuração e do cache DEVE ser diagnosticável sem
  debugger, incluindo exportação de diagnóstico pelo usuário.
- Métricas, telemetria e tracing são decisões pendentes. Qualquer coleta DEVE ser
  documentada e, quando envolver dados do usuário, opt-in.
- Relatórios de crash DEVEM ter consentimento e passar pela mesma redaction.

**Rationale:** em uma aplicação desktop, o suporte depende de evidências locais;
logs úteis e seguros encurtam o diagnóstico.

## Restrições Adicionais

### Escopo do Produto

- A aplicação é **apenas desktop**, sem versão web ou mobile.
- A aplicação é **read-only**: não escreve no Azure DevOps.
- A execução é de **instância única**, com lock de dados locais.
- Há **uma organização ativa por instalação**; não há múltiplas organizações
  simultâneas.
- A configuração obrigatória é composta por **nome da organização** e **PAT
  read-only**; projetos e times são obtidos a partir dela.
- A configuração é concluída por ação explícita de salvar; organização e PAT são
  persistidos em cofre seguro, e o PAT não é reexibido depois.

### Fontes Oficiais de Design

- A interface documentada é a especificação visual oficial; divergências exigem
  aprovação registrada.
- `docs/design/README.md` descreve escopo, cobertura e lacunas.
- `docs/design/foundations.md`, `tokens.md`, `components.md`, `screens.md`,
  `assets.md` e `behavior.md` são as referências de implementação.
- `docs/design/gaps.md` registra as lacunas que a spec precisa resolver.
- `docs/design/tokens.naming.json` define a nomenclatura; `tokens.css` e
  `tailwind.config.js` são derivados e não DEVEM ser editados à mão.
- `docs/design/assets/icons/` contém os SVGs oficiais; `assets/screens/` contém as
  referências visuais.
- `docs/design/_raw/` é evidência gerada, não fonte editorial. Em conflito, prevalece
  a seção de análise manual; blocos `fe:auto` DEVEM ser tratados conforme a data de
  extração.

### Requisitos de Aplicação Desktop

- A matriz de sistemas operacionais e versões mínimas DEVE ser definida em ADR
  antes da implementação.
- Builds distribuídos DEVEM ser assinados; quando aplicável, notarizados.
- A atualização automática DEVE verificar assinatura/integridade e suportar rollback.
- O ciclo de vida DEVE definir tray, minimizar, fechar, dormir/retomar e desligar.
- O comportamento offline e de primeira execução DEVE ser definido, com indicador de
  dados desatualizados.
- A janela DEVE ter tamanho mínimo, tratamento de DPI e navegação por teclado.
- Logs DEVEM ter local, rotação e exportação definidos; dados locais DEVEM ter local
  por SO, limpeza na desinstalação e migração versionada.

### Integração com Azure DevOps

- A versão da API e a escolha entre REST e SDK DEVEM ser fixadas em ADR.
- Paginação é obrigatória; chamadas paralelas DEVEM ter limite; `Retry-After` DEVE
  ser respeitado.
- A integração DEVE ter camada anticorrupção e modelo de domínio interno; DTOs da API
  NÃO DEVEM chegar à UI.
- Projetos, times, campos customizados, estados e identidades DEVEM ser mapeados
  explicitamente.
- Times DEVEM ser consultados por projeto; não existe lista global de times na
  organização.
- A política de frescor DEVE definir TTL, refresh manual/automático e indicador de
  staleness; polling agressivo é proibido.
- Erros DEVEM ser mapeados por recurso (401, 403, 404, 429, 5xx) com falha parcial.
- Os escopos DEVEM ser read-only; escrita NÃO DEVE ser implementada.
- Contratos DEVEM ter testes com fixtures gravadas.

### Dados Sensíveis e Privacidade

| Dado | Classificação | Tratamento |
|---|---|---|
| PAT | Segredo | Cofre do SO; nunca reexibido; redigido em logs |
| Nome da organização | Interno | Configuração local |
| Projetos, times, work items, PRs, pipelines, identidades | Confidencial | Cache criptografado em repouso; retenção definida |
| Logs e diagnóstico | Interno | Redigidos; retenção curta; exportação sob ação do usuário |

- O processamento é local e sob demanda. Nenhuma telemetria é enviada por padrão;
  qualquer coleta exige decisão explícita, opt-in e documentação.
- O usuário DEVE poder exportar e apagar configuração, cache e logs pela aplicação.
- A retenção inicial proposta é: cache com TTL configurável; logs com rotação e
  retenção curta (7 a 30 dias); exclusão na desinstalação.
- Exportação de diagnóstico NÃO DEVE conter PAT, cache integral ou dados pessoais
  além do necessário.
- Dados da organização NÃO DEVEM ser enviados a modelos de IA sem decisão explícita.
- A base legal e o aviso de privacidade DEVEM ser validados antes do release
  (LGPD/GDPR, conforme aplicável).
- O modelo de ameaças vigente está em
  [`docs/security/threat-model.md`](docs/security/threat-model.md).

### Decisões Técnicas Pendentes

As decisões abaixo NÃO foram tomadas e NÃO DEVEM ser presumidas. Cada uma exige ADR
antes da implementação correspondente:

1. Stack de interface e linguagem.
2. Runtime e empacotamento da aplicação desktop.
3. Gerenciamento de estado e navegação.
4. Persistência, cache e comportamento offline.
5. Versão da API, paginação e política de rate limit.
6. Ferramenta de testes, cobertura mínima e pipeline de CI.
7. Logs, métricas, telemetria e retenção.
8. Idiomas, acessibilidade e metas de compatibilidade.
9. Sistemas operacionais suportados e atualização da aplicação.
10. Mecanismo concreto de cofre do PAT por sistema operacional.

**Gate:** as decisões 1–6 DEVEM estar registradas antes da primeira implementação.
As decisões 7–10 DEVEM estar registradas antes do primeiro release. Uma feature que
não dependa de determinada decisão não é bloqueada por ela; o plano DEVE declarar
quais decisões a feature exige.

### Gestão de Dependências

- Toda dependência nova DEVE ser justificada no plano ou em ADR, com necessidade,
  manutenção, licença, segurança e impacto no tamanho da aplicação.
- APIs e recursos da plataforma DEVEM ser preferidos a bibliotecas que apenas
  reproduzam funcionalidade nativa.
- Dependências sem manutenção ativa ou com vulnerabilidades conhecidas NÃO DEVEM ser
  adicionadas.
- Lockfile e auditoria de vulnerabilidades DEVEM rodar no CI.
- Atualizações de dependência DEVEM ter cadência definida e ser registradas.

## Verificação e Governança

O fluxo operacional, os portões de qualidade, a definição de pronto, as convenções de
commit/PR e as guardas de IA estão em
[`CONTRIBUTING.md`](CONTRIBUTING.md). Nenhum merge DEVE ocorrer com o CI vermelho;
enquanto o CI não existir, a verificação é manual e registrada no PR.

### Autoridade

Esta constituição prevalece sobre práticas, convenções e preferências individuais.
Em caso de conflito, a constituição DEVE ser seguida ou emendada formalmente.

### Papéis e Aprovação

- **Responsável do projeto:** aprova emendas, ADRs estruturais e exceções.
- **Revisor:** toda mudança em fluxo crítico DEVE ter revisão humana; quando houver
  mais de um contribuidor, a revisão DEVE ser de outra pessoa.
- A aprovação DEVE ser registrada em spec, ADR ou PR; aprovação informal não conta.

### Emendas

Uma emenda DEVE conter: motivação, princípios ou seções afetadas, impacto esperado e
plano de migração quando houver mudança de comportamento. A emenda DEVE ser aprovada
pelo responsável do projeto e registrada com a nova versão.

### Versionamento

- MAJOR: remoção ou redefinição incompatível de princípio ou regra de governança.
- MINOR: novo princípio, nova seção ou expansão material de orientação.
- PATCH: esclarecimentos, correções de redação e refinamentos não semânticos.

### Conformidade e Revisão

- Toda especificação, plano, tarefa e revisão DEVE verificar conformidade com esta
  constituição.
- Violações DEVEM ser justificadas, registradas e aprovadas, ou removidas.
- A constituição DEVE ser revisada quando uma decisão pendente for resolvida e, no
  mínimo, antes de cada release.

**Version**: 2.0.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
