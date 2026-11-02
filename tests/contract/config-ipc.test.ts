import { describe, expect, it, vi } from 'vitest';
import type { ConfigView } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';

const { handlers } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => Promise<unknown>>(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: (...args: unknown[]) => Promise<unknown>) => {
      handlers.set(channel, listener);
    },
  },
  shell: {
    openExternal: vi.fn(async () => undefined),
  },
}));

import { registerIpcHandlers, type IpcDependencies } from '../../src/main/ipc/handlers';

function buildDeps(overrides: Partial<IpcDependencies> = {}) {
  const config: ConfigView = {
    organization: 'demo',
    status: 'configured',
    hasPat: true,
    patLast4: '1234',
    selectedProjectId: null,
    selectedTeamId: null,
    lastValidatedAt: '2026-11-02T00:00:00.000Z',
  };

  const deps = {
    config: {
      get: vi.fn(async () => ({
        organization: 'demo',
        normalizedOrganization: 'demo',
        status: 'configured',
        lastValidatedAt: config.lastValidatedAt,
        selectedProjectId: null,
        selectedTeamId: null,
        schemaVersion: 1,
      })),
      setOrganization: vi.fn(async () => undefined),
      setSelection: vi.fn(async () => undefined),
      reset: vi.fn(async () => undefined),
      setStatus: vi.fn(async () => undefined),
    },
    credentials: {
      save: vi.fn(async () => ({ patLast4: '1234' })),
      getLast4: vi.fn(async () => '1234'),
      has: vi.fn(async () => true),
      readPat: vi.fn(async () => 'figd_secret'),
      clear: vi.fn(async () => undefined),
    },
    cache: { clear: vi.fn(async () => undefined) },
    cacheKey: { clear: vi.fn(async () => undefined) },
    overviewCache: { clear: vi.fn(async () => undefined) },
    workItemsCache: { clear: vi.fn(async () => undefined) },
    pullRequestsCache: { clear: vi.fn(async () => undefined) },
    pipelinesCache: { clear: vi.fn(async () => undefined) },
    client: {
      validateAccess: vi.fn(async () => ({ displayName: 'Tester' })),
    },
    projects: {
      listProjects: vi.fn(async () => ({
        items: [],
        stale: false,
        fetchedAt: '2026-11-02T00:00:00.000Z',
      })),
      listTeams: vi.fn(async () => ({
        items: [],
        stale: false,
        fetchedAt: '2026-11-02T00:00:00.000Z',
      })),
    },
    overview: {
      load: vi.fn(async () => ({
        context: null,
        workItems: { ok: true, data: [], stale: false, fetchedAt: '2026-11-02T00:00:00.000Z' },
        pullRequest: {
          ok: true,
          data: null,
          stale: false,
          fetchedAt: '2026-11-02T00:00:00.000Z',
        },
        pipeline: {
          ok: true,
          data: null,
          stale: false,
          fetchedAt: '2026-11-02T00:00:00.000Z',
        },
        fetchedAt: null,
        stale: false,
      })),
    },
    diagnostics: { export: vi.fn(async () => 'diag.json') },
    appVersion: '0.1.0',
    ...overrides,
  } as unknown as IpcDependencies;

  return deps;
}

describe('config IPC contract', () => {
  it('valida, salva e retorna apenas a máscara', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('config:save')!({}, { organization: 'demo', pat: 'figd_x' });

    expect(result).toEqual({ ok: true, patLast4: '1234', user: { displayName: 'Tester' } });
    expect(deps.client.validateAccess).toHaveBeenCalledWith('demo', 'figd_x');
    expect(deps.credentials.save).toHaveBeenCalledWith('figd_x');
    expect(deps.config.setOrganization).toHaveBeenCalledWith('demo', 'configured');
    expect(JSON.stringify(result)).not.toContain('figd_x');
  });

  it('retorna a configuração sem PAT', async () => {
    registerIpcHandlers(buildDeps());

    const view = await handlers.get('config:get')!();

    expect(view).toMatchObject({ organization: 'demo', hasPat: true, patLast4: '1234' });
    expect(JSON.stringify(view)).not.toContain('figd_secret');
  });

  it('não persiste quando a validação falha', async () => {
    const deps = buildDeps({
      client: {
        validateAccess: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
        }),
      } as unknown as IpcDependencies['client'],
    });
    registerIpcHandlers(deps);

    const result = await handlers.get('config:save')!({}, { organization: 'demo', pat: 'bad' });

    expect(result).toMatchObject({ ok: false, error: { code: ErrorCode.CONFIG_PAT_INVALID } });
    expect(deps.credentials.save).not.toHaveBeenCalled();
    expect(deps.config.setOrganization).not.toHaveBeenCalled();
  });

  it.each([
    ErrorCode.CONFIG_PAT_INVALID,
    ErrorCode.CONFIG_FORBIDDEN,
    ErrorCode.CONFIG_ORG_NOT_FOUND,
    ErrorCode.CONFIG_RATE_LIMIT,
    ErrorCode.CONFIG_NETWORK,
  ])('mapeia falha %s sem persistir', async (code) => {
    const deps = buildDeps({
      client: {
        validateAccess: vi.fn(async () => {
          throw new AppErrorException(code);
        }),
      } as unknown as IpcDependencies['client'],
    });
    registerIpcHandlers(deps);

    const result = await handlers.get('config:save')!({}, { organization: 'demo', pat: 'x' });

    expect(result).toMatchObject({ ok: false, error: { code } });
    expect(deps.credentials.save).not.toHaveBeenCalled();
    expect(deps.config.setOrganization).not.toHaveBeenCalled();
  });

  it('retorna erro específico para campos vazios', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const semOrganizacao = await handlers.get('config:save')!({}, { organization: '', pat: 'x' });
    const semPat = await handlers.get('config:save')!({}, { organization: 'demo', pat: '' });

    expect(semOrganizacao).toMatchObject({
      ok: false,
      error: { code: ErrorCode.CONFIG_ORG_MISSING },
    });
    expect(semPat).toMatchObject({ ok: false, error: { code: ErrorCode.CONFIG_PAT_MISSING } });
    expect(deps.client.validateAccess).not.toHaveBeenCalled();
  });

  it('limpa os caches ao trocar de organização', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('config:save')!({}, { organization: 'other', pat: 'figd_x' });

    expect(result).toMatchObject({ ok: true });
    expect(deps.cache.clear).toHaveBeenCalledOnce();
    expect(deps.cacheKey.clear).toHaveBeenCalledOnce();
    expect(deps.overviewCache.clear).toHaveBeenCalledOnce();
    expect(deps.workItemsCache.clear).toHaveBeenCalledOnce();
    expect(deps.pullRequestsCache.clear).toHaveBeenCalledOnce();
    expect(deps.pipelinesCache.clear).toHaveBeenCalledOnce();
  });

  it('remove credenciais, cache, chave e configuração', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('config:remove')!();

    expect(result).toEqual({ ok: true });
    expect(deps.credentials.clear).toHaveBeenCalledOnce();
    expect(deps.cache.clear).toHaveBeenCalledOnce();
    expect(deps.cacheKey.clear).toHaveBeenCalledOnce();
    expect(deps.overviewCache.clear).toHaveBeenCalledOnce();
    expect(deps.workItemsCache.clear).toHaveBeenCalledOnce();
    expect(deps.pullRequestsCache.clear).toHaveBeenCalledOnce();
    expect(deps.pipelinesCache.clear).toHaveBeenCalledOnce();
    expect(deps.config.reset).toHaveBeenCalledOnce();
  });
});
