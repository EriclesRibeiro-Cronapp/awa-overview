import type { AppError } from './contracts';

export const ErrorCode = {
  CONFIG_ORG_MISSING: 'CFG-001',
  CONFIG_PAT_MISSING: 'CFG-002',
  CONFIG_PAT_INVALID: 'CFG-003',
  CONFIG_FORBIDDEN: 'CFG-004',
  CONFIG_NETWORK: 'CFG-005',
  CONFIG_RATE_LIMIT: 'CFG-006',
  CONFIG_SERVER: 'CFG-007',
  CONFIG_UNEXPECTED: 'CFG-008',
  CONFIG_ORG_NOT_FOUND: 'CFG-009',
  DATA_CACHE_CORRUPT: 'DATA-001',
  DATA_MIGRATION_FAILED: 'DATA-002',
  UI_RENDER_FAILED: 'UI-001',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

const MESSAGES: Record<ErrorCodeValue, string> = {
  'CFG-001': 'Informe o nome da organização.',
  'CFG-002': 'Informe o Personal Access Token.',
  'CFG-003': 'O token é inválido ou expirou. Gere um novo PAT com escopos de leitura.',
  'CFG-004':
    'O token não tem permissão para acessar este recurso. Verifique os escopos de leitura (Project and Team, Work Items, Code e Build).',
  'CFG-005': 'Não foi possível conectar. Verifique a rede e tente novamente.',
  'CFG-006': 'O Azure DevOps limitou as requisições. Aguarde e tente novamente.',
  'CFG-007': 'O Azure DevOps está indisponível no momento.',
  'CFG-008': 'Ocorreu um erro inesperado. Consulte o diagnóstico.',
  'CFG-009': 'Organização não encontrada. Verifique o nome e tente novamente.',
  'DATA-001': 'Os dados locais precisam ser recriados.',
  'DATA-002': 'Não foi possível atualizar os dados locais.',
  'UI-001': 'Não foi possível exibir esta seção.',
};

const RETRYABLE: ReadonlySet<ErrorCodeValue> = new Set([
  ErrorCode.CONFIG_NETWORK,
  ErrorCode.CONFIG_RATE_LIMIT,
  ErrorCode.CONFIG_SERVER,
]);

export class AppErrorException extends Error {
  readonly code: ErrorCodeValue;
  readonly retryable: boolean;
  readonly details?: string;

  constructor(code: ErrorCodeValue, details?: string) {
    super(MESSAGES[code]);
    this.name = 'AppErrorException';
    this.code = code;
    this.retryable = RETRYABLE.has(code);
    this.details = details;
  }
}

export function messageForCode(code: ErrorCodeValue): string {
  return MESSAGES[code];
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppErrorException) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      ...(error.details ? { details: error.details } : {}),
    };
  }

  return {
    code: ErrorCode.CONFIG_UNEXPECTED,
    message: MESSAGES[ErrorCode.CONFIG_UNEXPECTED],
    retryable: false,
  };
}
