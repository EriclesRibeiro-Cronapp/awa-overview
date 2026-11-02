# Feature Specification: Configuração e conexão com Azure DevOps

**Feature Branch**: `001-configuracao-azure-devops` (diretório de spec; sem branch git, pois não há hook de branch instalado)

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "Configuração e conexão com Azure DevOps — PAT + organização, cofre seguro, validação read-only, projetos e times."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar organização e PAT (Priority: P1)

O usuário abre a aplicação pela primeira vez, sem configuração. Ele informa o nome
da organização e um Personal Access Token (PAT) com escopos de leitura, aciona
"Salvar" e a aplicação valida as informações, guarda o PAT em cofre seguro e passa
a carregar os dados da organização.

**Why this priority**: sem configuração válida, a aplicação não tem dados para
exibir. É o ponto de entrada de todo o produto.

**Independent Test**: partir de uma instalação limpa, informar organização e PAT
válidos, salvar e verificar que a configuração foi aceita, o PAT ficou mascarado e
os projetos foram carregados.

**Acceptance Scenarios**:

1. **Given** que não há configuração salva, **When** o usuário informa organização e
   PAT válidos e salva, **Then** a configuração é aceita, o PAT é guardado em cofre e
   apenas os 4 últimos caracteres ficam visíveis.
2. **Given** um PAT inválido ou expirado, **When** o usuário salva, **Then** a
   aplicação exibe "token inválido ou expirado" e não persiste a configuração.
3. **Given** uma organização inexistente, **When** o usuário salva, **Then** a
   aplicação exibe "organização não encontrada" e não persiste a configuração.
4. **Given** um PAT válido sem permissão para listar projetos, **When** o usuário
   salva, **Then** a aplicação exibe "sem permissão" e mantém os campos para
   correção, sem gravar a configuração.
5. **Given** uma configuração já salva, **When** o usuário reabre a modal, **Then**
   a organização é exibida e o PAT aparece apenas mascarado.
6. **Given** a modal aberta, **When** o usuário consulta a ajuda do PAT, **Then** vê
   como criar o token, quais escopos usar e como revogá-lo.

---

### User Story 2 - Carregar projetos e times (Priority: P2)

Com a configuração válida, o usuário seleciona um projeto e, em seguida, um time
pertencente a esse projeto. As seleções ficam disponíveis durante a sessão e após
reiniciar a aplicação.

**Why this priority**: projetos e times definem o contexto dos dados exibidos nas
telas seguintes.

**Independent Test**: com configuração válida, abrir o seletor de projetos,
selecionar um projeto e verificar a lista de times daquele projeto.

**Acceptance Scenarios**:

1. **Given** uma configuração válida, **When** a aplicação carrega, **Then** os
   projetos da organização são listados no seletor.
2. **Given** um projeto selecionado, **When** o usuário abre o seletor de times,
   **Then** somente os times daquele projeto são listados.
3. **Given** um projeto sem times, **When** o seletor é aberto, **Then** a aplicação
   exibe um estado vazio explicativo.
4. **Given** uma falha ao carregar times, **When** o erro ocorre, **Then** a
   aplicação informa o problema sem apagar a configuração válida.

---

### User Story 3 - Remover ou trocar a configuração (Priority: P3)

O usuário remove a configuração ou troca a organização. A aplicação apaga o PAT do
cofre e os dados em cache, retornando ao estado de configuração inicial.

**Why this priority**: segurança e isolamento de dados entre organizações.

**Independent Test**: com configuração salva, acionar "Remover configuração" e
verificar que o PAT não está mais no cofre, o cache foi limpo e a aplicação voltou
à tela inicial de configuração.

**Acceptance Scenarios**:

1. **Given** uma configuração salva, **When** o usuário remove a configuração,
   **Then** o PAT é apagado do cofre, o cache é limpo e a tela de configuração é
   exibida.
2. **Given** uma configuração salva, **When** o usuário troca a organização,
   **Then** o cache da organização anterior é limpo antes de carregar a nova.
3. **Given** falha ao acessar o cofre, **When** a remoção é tentada, **Then** a
   aplicação informa o erro e não simula sucesso.

---

### Edge Cases

- PAT expirado ou revogado (401) durante o uso.
- PAT válido sem permissão para um recurso (403).
- Organização inexistente (404).
- Limite de requisições (429) com tempo de espera indicado.
- Falha de rede, timeout ou indisponibilidade do Azure DevOps (5xx).
- Organização informada com espaços, maiúsculas ou caracteres inválidos.
- PAT colado com espaços ou quebras de linha.
- PAT com escopos de escrita (risco residual; a aplicação não escreve).
- Cofre do sistema operacional indisponível, bloqueado ou corrompido.
- Cache local corrompido ou de uma versão anterior.
- Segunda instância da aplicação em execução.
- Reinício com configuração salva e sem rede.
- Organização com muitos projetos e carregamento lento.
- Projeto sem times ou time removido entre carregamentos.
- Nomes com acentos e caracteres não ASCII.
- Cancelamento da modal sem salvar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aplicação NÃO DEVE possuir login, cadastro, SSO ou OAuth; a
  operação depende de organização e PAT informados pelo usuário.
- **FR-002**: A modal de configuração DEVE conter os campos Organização e Personal
  Access Token e uma ação de salvar.
- **FR-003**: Ao salvar, a aplicação DEVE validar organização e PAT por chamada
  read-only antes de persistir qualquer informação.
- **FR-004**: O PAT DEVE ser armazenado em cofre seguro do sistema operacional; a
  configuração local DEVE guardar apenas a organização e preferências não sensíveis.
- **FR-005**: Após salvar, a interface DEVE exibir apenas os 4 últimos caracteres do
  PAT e NÃO DEVE permitir revelar ou copiar o valor completo.
- **FR-006**: Com configuração válida, a aplicação DEVE listar os projetos da
  organização e, para o projeto selecionado, listar os times daquele projeto.
- **FR-007**: A aplicação DEVE preservar o projeto e o time selecionados durante a
  sessão e após reiniciar, enquanto a configuração for válida.
- **FR-008**: A aplicação DEVE permitir remover a configuração, apagando o PAT do
  cofre e o cache da organização.
- **FR-009**: O PAT NÃO DEVE aparecer em telas, logs, mensagens de erro, URLs ou
  exportação de diagnóstico.
- **FR-010**: A aplicação DEVE distinguir e comunicar 401 (token inválido/expirado),
  403 (sem permissão), 404 (organização não encontrada), 429 (limite de requisições),
  falha de rede e erro do servidor, sem apagar a configuração em caso de 403.
- **FR-011**: A aplicação DEVE ser de instância única; uma segunda execução DEVE
  focar a janela existente, sem duplicar configuração.
- **FR-012**: Ao iniciar com configuração salva, a aplicação DEVE carregar os dados
  disponíveis em cache e indicar quando estiver offline ou desatualizada.
- **FR-013**: Na primeira execução, sem configuração, a aplicação DEVE apresentar o
  estado de configuração obrigatória antes de qualquer dado.
- **FR-014**: A modal DEVE oferecer orientação sobre como criar, escopar e revogar o
  PAT.
- **FR-015**: A aplicação DEVE ser read-only; NÃO DEVE executar operações de escrita
  no Azure DevOps.
- **FR-016**: Os dados em cache DEVEM ser protegidos em repouso e removidos quando a
  configuração for removida.
- **FR-017**: A validação DEVE ter estados explícitos (ocioso, validando, sucesso,
  erro), com a ação de salvar indisponível durante a validação.
- **FR-018**: A modal DEVE ser operável por teclado, com rótulos associados aos
  campos, foco visível e mensagens de erro anunciadas, atendendo a WCAG 2.2 AA.
- **FR-019**: A organização DEVE ser normalizada (espaços removidos e formato
  validado) antes da chamada ao Azure DevOps.
- **FR-020**: Eventos de configuração, validação e remoção DEVEM ser registrados com
  códigos estáveis e contexto operacional suficiente para diagnóstico, excluindo
  credenciais e conteúdo de dados.

### Key Entities *(include if feature involves data)*

- **Configuração**: organização, referência ao PAT no cofre, data da última
  validação e status (válida, inválida, não configurada).
- **Projeto**: identificador, nome, estado e organização à qual pertence.
- **Time**: identificador, nome e projeto ao qual pertence.
- **Cache**: instantâneo de projetos e times, organização e data da última
  atualização.
- **Contexto de sessão**: projeto e time selecionados.

### Requirement Coverage

| Requisitos | Cobertura |
|---|---|
| FR-001 a FR-005 | User Story 1 e Edge Cases de validação |
| FR-006 e FR-007 | User Story 2 |
| FR-008 | User Story 3 |
| FR-009 e FR-020 | Auditoria de logs/diagnóstico e SC-009 |
| FR-010 | Edge Cases de erro e SC-002 |
| FR-011 a FR-013 | Edge Cases de instância, reinício e primeira execução |
| FR-014 a FR-019 | User Story 1, acessibilidade e Edge Cases |
| FR-015 e FR-016 | Auditoria read-only e remoção de cache |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário com PAT válido conclui a configuração em menos de 2
  minutos na primeira tentativa.
- **SC-002**: 100% dos casos 401, 403, 404, 429, rede e 5xx exibem mensagem distinta
  e acionável, sem apagar a configuração quando ela ainda for válida.
- **SC-003**: Após salvar, o PAT nunca é exibido por inteiro; apenas os 4 últimos
  caracteres aparecem, em 100% das reaberturas da modal.
- **SC-004**: Em rede corporativa estável (latência ≤ 100 ms), a lista de até 100
  projetos é exibida em menos de 5 segundos após a validação.
- **SC-005**: Após remover a configuração, nenhuma credencial permanece no cofre e
  nenhum dado da organização permanece em cache, verificado por inspeção e teste.
- **SC-006**: Com configuração salva e sem rede, a aplicação inicia e exibe dados em
  cache em menos de 3 segundos, com indicação de desatualização.
- **SC-007**: Nenhuma requisição de escrita é enviada ao Azure DevOps em nenhum fluxo
  desta feature, verificado por auditoria de tráfego.
- **SC-008**: A modal é concluída apenas com teclado e atende a WCAG 2.2 AA para
  contraste, foco, rótulos e anúncio de erros.
- **SC-009**: Nenhum segredo aparece em logs, mensagens, URLs ou exportação de
  diagnóstico, verificado por teste automatizado de vazamento.
- **SC-010**: Uma segunda instância não cria nova janela nem duplica configuração e
  foca a instância existente em menos de 2 segundos.

## Assumptions

- A aplicação é desktop, read-only, de instância única e sem autenticação própria.
- Há uma única organização ativa por instalação; múltiplas organizações simultâneas
  estão fora de escopo.
- O usuário possui um PAT com escopos de leitura e permissão para listar projetos e
  times.
- Times pertencem a projetos; não existe lista global de times na organização.
- O sistema operacional oferece cofre seguro disponível para o usuário.
- A primeira validação exige rede; depois, o cache permite uso offline com aviso.
- A interface é em português do Brasil.
- A modal documentada em `docs/design/screens.md` é a referência visual; o botão de
  salvar foi adicionado no Figma.
- A proteção visual avançada do cofre é uma feature futura e não faz parte desta
  especificação.
- PATs com escopos de escrita são um risco residual do usuário; a aplicação orienta
  e nunca escreve.

## Out of Scope

- Login, cadastro, SSO, OAuth ou qualquer autenticação própria.
- Múltiplas organizações simultâneas.
- Qualquer operação de escrita no Azure DevOps.
- Proteção visual e substituição do cofre (feature futura).
- Telas de Overview, Work items, Pull requests e Pipelines.
