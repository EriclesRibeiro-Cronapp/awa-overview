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

function buildDeps(projectId: string | null = 'p1') {
  return {
    config: {
      get: vi.fn(async () => ({
        organization: 'demo',
        normalizedOrganization: 'demo',
        status: 'configured',
        selectedProjectId: projectId,
        selectedTeamId: projectId ? 't1' : null,
        lastValidatedAt: null,
        schemaVersion: 1,
      })),
      setOrganization: vi.fn(),
      setSelection: vi.fn(),
      reset: vi.fn(),
      setStatus: vi.fn(),
    },
    credentials: {
      readPat: vi.fn(async () => 'pat-secret'),
      getLast4: vi.fn(async () => '1234'),
      has: vi.fn(async () => true),
      save: vi.fn(),
      clear: vi.fn(),
    },
    projects: {
      listProjects: vi.fn(async () => ({
        items: [{ id: 'p1', name: 'Projeto Teste', state: 'wellFormed' }],
        stale: false,
        fetchedAt: '2026-11-02T10:00:00.000Z',
      })),
      listTeams: vi.fn(async () => ({
        items: [{ id: 't1', name: 'Time A', projectId: 'p1' }],
        stale: false,
        fetchedAt: '2026-11-02T10:00:00.000Z',
      })),
    },
    workItems: {
      load: vi.fn(async () => ({
        context: null,
        items: [],
        summary: { total: 0, backlog: 0, inProgress: 0, done: 0 },
        truncated: false,
        fetchedAt: null,
        stale: false,
      })),
    },
    overview: { load: vi.fn() },
    cache: { clear: vi.fn() },
    cacheKey: { clear: vi.fn() },
    overviewCache: { clear: vi.fn() },
    workItemsCache: { clear: vi.fn() },
    client: {},
    diagnostics: {},
    appVersion: '0.1.0',
  } as unknown as IpcDependencies;
}

describe('work items IPC contract', () => {
  it('retorna vazio sem projeto', async () => {
    const deps = buildDeps(null);
    registerIpcHandlers(deps);

    const result = await handlers.get('workItems:load')!({}, {});

    expect(result).toMatchObject({
      ok: true,
      data: { context: null, items: [], summary: { total: 0 } },
    });
    expect(deps.workItems.load).not.toHaveBeenCalled();
  });

  it('resolve o contexto e repassa force', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('workItems:load')!({}, { force: true });

    expect(result).toMatchObject({ ok: true });
    expect(deps.workItems.load).toHaveBeenCalledWith({
      organization: 'demo',
      pat: 'pat-secret',
      projectId: 'p1',
      projectName: 'Projeto Teste',
      teamId: 't1',
      teamName: 'Time A',
      force: true,
    });
  });
});
