import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('header customizado exibe logo, arraste e controles da janela', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-window-${Date.now()}`);
  const app = await electron.launch({ args: [mainEntry, `--user-data-dir=${userData}`] });

  try {
    const window = await app.firstWindow();
    await window.reload();
    const logo = window.getByRole('img', { name: 'AWA Overview' });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('width', '95');
    await expect(logo).toHaveAttribute('height', '12');

    const state = await app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      return {
        width: win.getBounds().width,
        height: win.getBounds().height,
        resizable: win.isResizable(),
        maximizable: win.isMaximizable(),
        fullscreenable: win.isFullScreenable(),
      };
    });
    expect(state).toEqual({
      width: 900,
      height: 700,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
    });

    const regions = await window.evaluate(() => {
      const header = document.querySelector('.window-titlebar');
      const button = document.querySelector('.window-control');
      return {
        header: header ? getComputedStyle(header).getPropertyValue('-webkit-app-region') : '',
        button: button ? getComputedStyle(button).getPropertyValue('-webkit-app-region') : '',
      };
    });
    expect(regions.header).toBe('drag');
    expect(regions.button).toBe('no-drag');

    await window.getByRole('button', { name: 'Minimizar' }).click();
    await expect
      .poll(() =>
        app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.isMinimized()),
      )
      .toBe(true);

    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.restore());
    await window.locator('.window-titlebar').getByRole('button', { name: 'Fechar' }).click();
    await app.waitForEvent('close');
  } finally {
    await app.close().catch(() => undefined);
  }
});

test('seletores ficam no footer e configurações no header', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-window-config-${Date.now()}`);
  await mkdir(userData, { recursive: true });
  await writeFile(
    join(userData, 'config.json'),
    JSON.stringify({
      schemaVersion: 1,
      organization: 'demo',
      normalizedOrganization: 'demo',
      status: 'configured',
      lastValidatedAt: '2026-11-02T00:00:00.000Z',
      selectedProjectId: null,
      selectedTeamId: null,
    }),
    'utf8',
  );

  const app = await electron.launch({ args: [mainEntry, `--user-data-dir=${userData}`] });
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    await app.evaluate(({ ipcMain }) => {
      ipcMain.removeHandler('projects:list');
      ipcMain.handle('projects:list', async () => ({
        ok: true,
        items: [{ id: 'p1', name: 'Projeto Teste', state: 'wellFormed' }],
        stale: false,
        fetchedAt: new Date().toISOString(),
      }));
      ipcMain.removeHandler('teams:list');
      ipcMain.handle('teams:list', async () => ({
        ok: true,
        items: [{ id: 't1', name: 'Time A', projectId: 'p1' }],
        stale: false,
        fetchedAt: new Date().toISOString(),
      }));
    });

    const window = await app.firstWindow();
    await window.reload();
    await expect(window.getByRole('button', { name: 'Configurações' })).toBeVisible();
    await expect(window.locator('.window-titlebar').getByLabel('Projeto')).toHaveCount(0);
    await expect(window.locator('.window-titlebar').getByLabel('Time')).toHaveCount(0);
    await expect(window.locator('.product-footer').getByLabel('Projeto')).toBeVisible();
    await expect(window.locator('.product-footer').getByLabel('Time')).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
