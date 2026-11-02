import { describe, expect, it, vi } from 'vitest';
import { removeConfiguration } from '../../src/main/services/config-removal';

describe('removeConfiguration', () => {
  it('limpa credenciais, cache, chave e configuração', async () => {
    const calls: string[] = [];
    const deps = {
      credentials: { clear: vi.fn(async () => void calls.push('credentials')) },
      cache: { clear: vi.fn(async () => void calls.push('cache')) },
      cacheKey: { clear: vi.fn(async () => void calls.push('cacheKey')) },
      overviewCache: { clear: vi.fn(async () => void calls.push('overviewCache')) },
      workItemsCache: { clear: vi.fn(async () => void calls.push('workItemsCache')) },
      pullRequestsCache: { clear: vi.fn(async () => void calls.push('pullRequestsCache')) },
      pipelinesCache: { clear: vi.fn(async () => void calls.push('pipelinesCache')) },
      config: { reset: vi.fn(async () => void calls.push('config')) },
    };

    await removeConfiguration(deps);

    expect(calls).toEqual([
      'credentials',
      'cache',
      'cacheKey',
      'overviewCache',
      'workItemsCache',
      'pullRequestsCache',
      'pipelinesCache',
      'config',
    ]);
  });
});
