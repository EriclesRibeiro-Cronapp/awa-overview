export const ptBR = {
  app: {
    title: 'AWA Overview',
    brandSuffix: '• Overview',
    loading: 'Carregando…',
    updatedAt: 'Atualizado em',
  },
  config: {
    title: 'Configurações',
    organization: 'Organização',
    organizationPlaceholder: 'Nome da organização',
    pat: 'Personal Access Token',
    patPlaceholder: 'Ex.: gyt4576FTGR45645...',
    save: 'Salvar',
    saving: 'Validando…',
    remove: 'Remover configuração',
    removeTitle: 'Remover configuração',
    removeConfirm:
      'Tem certeza? O PAT, o cache e a seleção serão apagados desta instalação.',
    removeAction: 'Remover',
    removing: 'Removendo…',
    help: 'Como criar e revogar o PAT',
    requiredTitle: 'Configuração necessária',
    requiredBody:
      'Informe a organização e um PAT com escopos de leitura para carregar os dados do Azure DevOps.',
    configuredAs: 'Conectado como',
    maskedPat: 'Token salvo',
  },
  projects: {
    project: 'Projeto',
    team: 'Time',
    selectProject: 'Selecione um projeto',
    selectTeam: 'Selecione um time',
    noTeams: 'Este projeto não possui times.',
    stale: 'Dados desatualizados',
  },
  errors: {
    unexpected: 'Ocorreu um erro inesperado.',
  },
} as const;

export type Messages = typeof ptBR;
