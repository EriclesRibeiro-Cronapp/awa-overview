import { describe, expect, it, vi } from 'vitest';
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
}));

import { registerIpcHandlers, type IpcDependencies } from '../../src/main/ipc/handlers';

function buildDeps(overrides: Partial<IpcDependencies> = {}) {
  return {
    config: {
      get: vi.fn(async () => ({
        organization: 'demo',
        normalizedOrganization: 'demo',
        status: 'configured',
        lastValidatedAt: null,
        selectedProjectId: null,
        selectedTeamId: null,
        schemaVersion: 1,
      })),
      setSelection: vi.fn(async () => undefined),
    },
    credentials: { readPat: vi.fn(async () => 'figd_secret') },
    cache: { clear: vi.fn() },
    cacheKey: { clear: vi.fn() },
    client: {},
    projects: {
      listProjects: vi.fn(async () => ({
        items: [{ id: 'p1', name: 'Projeto', state: 'wellFormed' }],
        stale: false,
        fetchedAt: '2026-11-02T00:00:00.000Z',
      })),
      listTeams: vi.fn(async () => ({
        items: [{ id: 't1', name: 'Time', projectId: 'p1' }],
        stale: true,
        fetchedAt: '2026-11-02T00:00:00.000Z',
      })),
    },
    diagnostics: { export: vi.fn() },
    appVersion: '0.1.0',
    ...overrides,
  } as unknown as IpcDependencies;
}

describe('projects IPC contract', () => {
  it('lista projetos da conexão ativa', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('projects:list')!({}, { force: false });

    expect(result).toMatchObject({ ok: true, stale: false });
    expect(deps.projects.listProjects).toHaveBeenCalledWith('demo', 'figd_secret', false);
  });

  it('lista times do projeto informado', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('teams:list')!({}, { projectId: 'p1' });

    expect(result).toMatchObject({ ok: true, stale: true });
    expect(deps.projects.listTeams).toHaveBeenCalledWith('demo', 'figd_secret', 'p1', undefined);
  });

  it('persiste a seleção de projeto e time', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('session:select')!({}, { projectId: 'p1', teamId: 't1' });

    expect(result).toEqual({ ok: true });
    expect(deps.config.setSelection).toHaveBeenCalledWith({ projectId: 'p1', teamId: 't1' });
  });

  it('devolve erro de rede sem apagar a configuração', async () => {
    const deps = buildDeps({
      projects: {
        listProjects: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
        }),
        listTeams: vi.fn(),
      } as unknown as IpcDependencies['projects'],
    });
    registerIpcHandlers(deps);

    const result = await handlers.get('projects:list')!({}, {});

    expect(result).toMatchObject({ ok: false, error: { code: ErrorCode.CONFIG_NETWORK } });
    expect(deps.config.setSelection).not.toHaveBeenCalled();
  });
});
