import { beforeEach, describe, expect, it, vi } from 'vitest';

const { expose } = vi.hoisted(() => ({ expose: vi.fn() }));

vi.mock('electron', () => ({
  contextBridge: { exposeInMainWorld: (...args: unknown[]) => expose(...args) },
  ipcRenderer: { invoke: vi.fn() },
}));

describe('preload IPC contract', () => {
  beforeEach(() => {
    vi.resetModules();
    expose.mockClear();
  });

  it('expõe os canais definidos no contrato', async () => {
    await import('../../src/preload/index');

    expect(expose).toHaveBeenCalledWith('api', expect.any(Object));
    const api = expose.mock.calls[0]?.[1] as Record<string, Record<string, unknown>>;

    expect(Object.keys(api).sort()).toEqual([
      'app',
      'config',
      'diagnostics',
      'overview',
      'pipelines',
      'projects',
      'pullRequests',
      'session',
      'windowControls',
      'workItems',
    ]);
    expect(typeof api.config.get).toBe('function');
    expect(typeof api.config.save).toBe('function');
    expect(typeof api.config.remove).toBe('function');
    expect(typeof api.projects.list).toBe('function');
    expect(typeof api.projects.teams).toBe('function');
    expect(typeof api.overview.load).toBe('function');
    expect(typeof api.workItems.load).toBe('function');
    expect(typeof api.pullRequests.load).toBe('function');
    expect(typeof api.pipelines.load).toBe('function');
    expect(typeof api.windowControls.minimize).toBe('function');
    expect(typeof api.windowControls.close).toBe('function');
    expect(typeof api.session.select).toBe('function');
    expect(typeof api.diagnostics.export).toBe('function');
    expect(typeof api.app.version).toBe('function');
    expect(typeof api.app.openExternal).toBe('function');
  });
});
