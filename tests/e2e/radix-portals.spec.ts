import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('portais Radix ficam nas camadas corretas e acima do titlebar/overlay', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-radix-portals');
  await mkdir(userData, { recursive: true });
  await writeFile(
    join(userData, 'config.json'),
    JSON.stringify({
      schemaVersion: 1,
      organization: 'demo',
      normalizedOrganization: 'demo',
      status: 'configured',
      lastValidatedAt: '2026-11-02T00:00:00.000Z',
      selectedProjectId: 'p1',
      selectedTeamId: 't1',
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
      ipcMain.removeHandler('overview:load');
      ipcMain.handle('overview:load', async () => ({
        ok: true,
        data: {
          context: {
            organization: 'demo',
            projectId: 'p1',
            projectName: 'Projeto Teste',
            teamId: 't1',
            teamName: 'Time A',
          },
          workItems: { ok: true, data: [], stale: false, fetchedAt: new Date().toISOString() },
          pullRequests: { ok: true, data: [], stale: false, fetchedAt: new Date().toISOString() },
          pipelines: { ok: true, data: [], stale: false, fetchedAt: new Date().toISOString() },
          fetchedAt: new Date().toISOString(),
          stale: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await window.reload();

    await window.getByLabel('Projeto').click();
    await expect(window.getByRole('listbox')).toBeVisible();

    const selectLayers = await window.evaluate(() => {
      const content = document.querySelector<HTMLElement>('.radix-select-content');
      const titlebar = document.querySelector<HTMLElement>('.window-titlebar');
      const trigger = document.querySelector<HTMLElement>('.radix-select-trigger');
      if (!content || !titlebar || !trigger) return null;
      return {
        contentZ: Number(getComputedStyle(content).zIndex),
        titlebarZ: Number(getComputedStyle(titlebar).zIndex),
        inAppRoot: content.closest('#root') === document.getElementById('root'),
        contentNoDrag: getComputedStyle(content).getPropertyValue('-webkit-app-region'),
        triggerNoDrag: getComputedStyle(trigger).getPropertyValue('-webkit-app-region'),
      };
    });
    expect(selectLayers).not.toBeNull();
    expect(selectLayers!.contentZ).toBeGreaterThan(selectLayers!.titlebarZ);
    expect(selectLayers!.inAppRoot).toBe(true);
    expect(selectLayers!.contentNoDrag).toBe('no-drag');
    expect(selectLayers!.triggerNoDrag).toBe('no-drag');

    await window.getByRole('option', { name: 'Projeto Teste' }).click();
    await expect(window.getByRole('listbox')).toHaveCount(0);

    await window.getByRole('button', { name: 'Configurações' }).click();
    await expect(window.getByRole('dialog', { name: 'Configurações' })).toBeVisible();

    const dialogLayers = await window.evaluate(() => {
      const overlay = document.querySelector<HTMLElement>('.modal-overlay');
      const content = document.querySelector<HTMLElement>('.modal-content');
      const titlebar = document.querySelector<HTMLElement>('.window-titlebar');
      const board = document.querySelector<HTMLElement>('.overview-grid');
      return {
        overlayZ: overlay ? Number(getComputedStyle(overlay).zIndex) : -1,
        contentZ: content ? Number(getComputedStyle(content).zIndex) : -1,
        titlebarZ: titlebar ? Number(getComputedStyle(titlebar).zIndex) : -1,
        overlayInBody: Boolean(overlay && overlay.closest('body') === document.body),
        contentOverBoard: Boolean(
          content &&
            board &&
            content.getBoundingClientRect().top < board.getBoundingClientRect().bottom,
        ),
      };
    });
    expect(dialogLayers).not.toBeNull();
    expect(dialogLayers!.contentZ).toBeGreaterThan(dialogLayers!.overlayZ);
    expect(dialogLayers!.overlayInBody).toBe(true);
    expect(dialogLayers!.contentOverBoard).toBe(true);
    expect(dialogLayers!.titlebarZ).toBeGreaterThan(dialogLayers!.overlayZ);

    await window.keyboard.press('Escape');
    await expect(window.getByRole('dialog')).toBeHidden();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
