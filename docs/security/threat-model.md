# Modelo de ameaças — AWA Overview

## Escopo

Aplicação desktop, **sem autenticação própria**, **read-only**, instância única.
A única credencial é um **PAT read-only** informado pelo usuário na modal de
configuração, junto com o **nome da organização** do Azure DevOps. A configuração
ativa é única por instalação.

Ficam fora do escopo: servidor próprio, login/SSO, escrita no Azure DevOps e
múltiplas organizações simultâneas.

## Ativos e classificação

| Ativo | Classificação | Onde vive |
|---|---|---|
| PAT | **Segredo** | Cofre do SO; nunca em arquivo de configuração |
| Nome da organização | Interno | Configuração local |
| Projetos, times, work items, PRs, pipelines, identidades | **Confidencial** | Memória e cache local |
| Logs e diagnóstico | Interno (redigido) | Disco local |
| Screenshots/exportações | Confidencial | Disco local |

## Fronteiras de confiança

1. **UI ↔ serviço de credenciais**: a UI nunca lê o PAT depois de salvo; só envia
   um novo valor para validação/gravação.
2. **Aplicação ↔ Azure DevOps**: HTTPS com validação de certificado.
3. **Aplicação ↔ cache local**: dados confidenciais em repouso.
4. **Aplicação ↔ logs/diagnóstico**: somente dados redigidos.
5. **Aplicação ↔ modelo de IA**: nenhum segredo ou dado confidencial sem decisão
   explícita.

## Ameaças e mitigações

| ID | Ameaça | Impacto | Mitigação |
|---|---|---|---|
| T1 | PAT gravado em texto plano ou backup | Vazamento total da conta | Cofre do SO (Credential Manager/DPAPI, Keychain, libsecret); config guarda só a org |
| T2 | PAT em log, erro ou crash dump | Vazamento em arquivo de suporte | Redaction central no logger; proibir headers/query; crash com consentimento |
| T3 | PAT reexibido na UI ou copiado | Exposição por omissão | Campo mascarado, exibir só os 4 últimos, sem botão de copiar/reexibir |
| T4 | PAT em memória/swap/dump | Extração por malware local | Minimizar tempo em memória; limpar ao fechar; não manter em estado global |
| T5 | PAT com escopos de escrita | Dano à organização | Orientar escopos read-only; validar e avisar; nunca exigir escrita |
| T6 | PAT em URL/query string | Vazamento em histórico/proxy | Usar header `Authorization`; nunca query string |
| T7 | Interceptação de tráfego | Roubo de token/dados | HTTPS obrigatório; validação de certificado |
| T8 | Cache local sem proteção | Dados da organização expostos | Criptografia em repouso; retenção; limpeza ao remover config/desinstalar |
| T9 | Backup/sincronização em nuvem | Cópia não controlada | Armazenar em diretório local não sincronizado; documentar |
| T10 | Support bundle ou prompt de IA com PAT | Vazamento para terceiros | Exportação sem segredos; nunca enviar PAT a modelo |
| T11 | Duas instâncias | Corrupção de cache e tokens duplicados | Instância única com lock |
| T12 | Mensagem de erro ecoa o token | Exposição em tela/suporte | Mensagens fixas por código; nunca interpolar credencial |
| T13 | Shoulder surfing/screenshot | Exposição visual | Campo mascarado; token nunca reexibido |
| T14 | Malware local | Acesso ao cofre/cache | Limitar superfície; cofre do SO; sem segredo em claro |

## Exposição do PAT — regras específicas

1. Entrada com `type=password`, `autocomplete=off` e sem corretor.
2. Validar com uma chamada read-only (listar projetos) antes de salvar; erro nunca
   ecoa o valor.
3. Após salvar, exibir apenas os 4 últimos caracteres e a data de atualização.
4. Não oferecer copiar/ver o token salvo. Para trocar, o usuário digita novamente.
5. Remover a configuração apaga o PAT do cofre e o cache da organização.
6. O PAT nunca aparece em logs, mensagens, URLs, crash reports ou exportação de
   diagnóstico.
7. Escopos recomendados: leitura de projetos/times, work items, código e builds.
   Escrita não é necessária para o produto.
8. Instruir onde criar e revogar o PAT na própria modal de configuração.

## Privacidade e dados pessoais

- Os dados do Azure DevOps podem conter nomes, e-mails e identificadores de
  pessoas. O processamento é **local** e sob demanda do usuário.
- Nenhuma telemetria é enviada por padrão. Qualquer coleta exige decisão explícita,
  opt-in e documentação.
- O usuário DEVE poder exportar e apagar os dados locais (configuração, cache e
  logs) pela própria aplicação.
- Retenção inicial proposta: cache com TTL configurável; logs com rotação e retenção
  curta (7 a 30 dias); exclusão na desinstalação.
- A base legal e o aviso de privacidade DEVEM ser validados antes do release
  (LGPD/GDPR, conforme aplicável).

## Riscos residuais

- Um atacante com acesso ao mesmo usuário do SO pode, em tese, acessar o cofre.
- Strings em memória não podem ser garantidamente apagadas em runtimes gerenciados.
- Capturas de tela externas não são controláveis pela aplicação.
- Sincronização de diretórios por ferramentas externas foge do controle do app.

Esses riscos DEVEM ser aceitos explicitamente no release e revisados neste
documento.
