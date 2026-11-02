import { describe, expect, it, vi } from 'vitest';
import type { IpcDependencies } from '../../src/main/ipc/handlers';

const { handlers, openExternal } = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => Promise<unknown>>(),
  openExternal: vi.fn(async () => undefined),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, listener: (...args: unknown[]) => Promise<unknown>) => {
      handlers.set(channel, listener);
    },
  },
  shell: { openExternal },
}));

import { registerIpcHandlers } from '../../src/main/ipc/handlers';

function buildDeps(overrides: Record<string, unknown> = {}, projectId: string | null = 'p1') {
  const deps = {
    config: {
      get: vi.fn(async () => ({
        organization: 'demo',
        normalizedOrganization: 'demo',
        status: 'configured',
        lastValidatedAt: null,
        selectedProjectId: projectId,
        selectedTeamId: projectId ? 't1' : null,
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
    overview: {
      load: vi.fn(async () => ({
        context: null,
        workItems: { ok: true, data: [], stale: false, fetchedAt: '2026-11-02T10:00:00.000Z' },
        pullRequest: {
          ok: true,
          data: null,
          stale: false,
          fetchedAt: '2026-11-02T10:00:00.000Z',
        },
        pipeline: {
          ok: true,
          data: null,
          stale: false,
          fetchedAt: '2026-11-02T10:00:00.000Z',
        },
        fetchedAt: null,
        stale: false,
      })),
    },
    cache: { clear: vi.fn() },
    cacheKey: { clear: vi.fn() },
    overviewCache: { clear: vi.fn() },
    client: {},
    diagnostics: {},
    appVersion: '0.1.0',
    ...overrides,
  } as unknown as IpcDependencies;

  return deps;
}

describe('overview IPC contract', () => {
  it('retorna contexto nulo sem projeto selecionado', async () => {
    const deps = buildDeps({}, null);
    registerIpcHandlers(deps);

    const result = await handlers.get('overview:load')!({}, {});

    expect(result).toMatchObject({ ok: true, data: { context: null } });
    expect(deps.overview.load).not.toHaveBeenCalled();
  });

  it('resolve nomes do contexto e repassa force', async () => {
    const deps = buildDeps();
    registerIpcHandlers(deps);

    const result = await handlers.get('overview:load')!({}, { force: true });

    expect(result).toMatchObject({ ok: true });
    expect(deps.overview.load).toHaveBeenCalledWith({
      organization: 'demo',
      pat: 'pat-secret',
      projectId: 'p1',
      projectName: 'Projeto Teste',
      teamId: 't1',
      teamName: 'Time A',
      force: true,
    });
  });

  it('retorna CFG-001 sem organização', async () => {
    const deps = buildDeps({
      config: {
        get: vi.fn(async () => ({
          organization: null,
          normalizedOrganization: null,
          status: 'unconfigured',
          selectedProjectId: null,
          selectedTeamId: null,
        })),
      },
    });
    registerIpcHandlers(deps);

    const result = await handlers.get('overview:load')!({}, {});

    expect(result).toMatchObject({ ok: false, error: { code: 'CFG-001' } });
  });

  it('abre somente links do Azure DevOps', async () => {
    registerIpcHandlers(buildDeps());

    const allowed = await handlers.get('app:openExternal')!({}, {
      url: 'https://dev.azure.com/demo/project/_workitems/edit/1',
    });
    const blocked = await handlers.get('app:openExternal')!({}, {
      url: 'https://example.com/phishing',
    });

    expect(allowed).toEqual({ ok: true });
    expect(blocked).toMatchObject({ ok: false });
    expect(openExternal).toHaveBeenCalledTimes(1);
  });
});
