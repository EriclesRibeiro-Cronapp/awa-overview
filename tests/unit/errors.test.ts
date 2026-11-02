import { describe, expect, it } from 'vitest';
import { AppErrorException, ErrorCode, messageForCode, toAppError } from '@shared/errors';

describe('error catalog', () => {
  it('expõe mensagem e retry por código', () => {
    const error = new AppErrorException(ErrorCode.CONFIG_RATE_LIMIT);

    expect(error.message).toBe(messageForCode(ErrorCode.CONFIG_RATE_LIMIT));
    expect(error.retryable).toBe(true);
    expect(toAppError(error)).toMatchObject({
      code: ErrorCode.CONFIG_RATE_LIMIT,
      retryable: true,
    });
  });

  it('classifica erro desconhecido como inesperado', () => {
    expect(toAppError(new Error('boom'))).toEqual({
      code: ErrorCode.CONFIG_UNEXPECTED,
      message: messageForCode(ErrorCode.CONFIG_UNEXPECTED),
      retryable: false,
    });
  });

  it('mantém detalhes quando fornecidos', () => {
    const error = new AppErrorException(ErrorCode.CONFIG_FORBIDDEN, 'detalhe técnico');

    expect(toAppError(error).details).toBe('detalhe técnico');
  });
});
