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

describe('window controls IPC', () => {
  it('minimiza e fecha somente a janela principal', async () => {
    const windowControls = {
      minimize: vi.fn(),
      close: vi.fn(),
    };
    registerIpcHandlers({ windowControls } as unknown as IpcDependencies);

    expect(await handlers.get('window:minimize')!({})).toEqual({ ok: true });
    expect(await handlers.get('window:close')!({})).toEqual({ ok: true });
    expect(windowControls.minimize).toHaveBeenCalledOnce();
    expect(windowControls.close).toHaveBeenCalledOnce();
  });
});
