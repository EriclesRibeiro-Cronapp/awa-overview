import { describe, expect, it, vi } from 'vitest';
import type { IpcDependencies } from '../../src/main/ipc/handlers';

const { handlers } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => Promise<unknown>>(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: (...args: unknown[]) => Promise<unknown>) => {
      handlers.set(channel, listener);
    },
  },
  shell: { openExternal: vi.fn(async () => undefined) },
}));

import { registerIpcHandlers } from '../../src/main/ipc/handlers';

function deps(projectId: string | null = 'p1') {
  return {
    config: {
      get: vi.fn(async () => ({
        organization: 'demo',
        normalizedOrganization: 'demo',
        status: 'configured',
        selectedProjectId: projectId,
        selectedTeamId: null,
        lastValidatedAt: null,
        schemaVersion: 1,
      })),
    },
    credentials: { readPat: vi.fn(async () => 'pat-secret') },
    projects: {
      listProjects: vi.fn(async () => ({
        items: [{ id: 'p1', name: 'Projeto Teste', state: 'wellFormed' }],
        stale: false,
        fetchedAt: '',
      })),
      listTeams: vi.fn(async () => ({ items: [], stale: false, fetchedAt: '' })),
    },
    pipelines: {
      load: vi.fn(async () => ({
        context: null,
        items: [],
        truncated: false,
        fetchedAt: null,
        stale: false,
      })),
    },
    workItems: { load: vi.fn() },
    pullRequests: { load: vi.fn() },
    overview: { load: vi.fn() },
    cache: { clear: vi.fn() },
    cacheKey: { clear: vi.fn() },
    overviewCache: { clear: vi.fn() },
    workItemsCache: { clear: vi.fn() },
    pullRequestsCache: { clear: vi.fn() },
    pipelinesCache: { clear: vi.fn() },
    client: {},
    diagnostics: {},
    appVersion: '0.1.0',
  } as unknown as IpcDependencies;
}

describe('pipelines IPC contract', () => {
  it('retorna vazio sem projeto', async () => {
    const depsValue = deps(null);
    registerIpcHandlers(depsValue);
    const result = await handlers.get('pipelines:load')!({}, {});
    expect(result).toMatchObject({ ok: true, data: { context: null, items: [] } });
  });

  it('resolve contexto e repassa force', async () => {
    const depsValue = deps();
    registerIpcHandlers(depsValue);
    const result = await handlers.get('pipelines:load')!({}, { force: true });
    expect(result).toMatchObject({ ok: true });
    expect(depsValue.pipelines.load).toHaveBeenCalledWith({
      organization: 'demo',
      pat: 'pat-secret',
      projectId: 'p1',
      projectName: 'Projeto Teste',
      teamId: null,
      teamName: null,
      force: true,
    });
  });
});
