import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('Dialog, Select, Tabs e Separator funcionam com mouse e teclado', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-radix-controls');
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

    const overviewTab = window.getByRole('tab', { name: 'Overview' });
    const workItemsTab = window.getByRole('tab', { name: 'Work items' });
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    await workItemsTab.click();
    await expect(workItemsTab).toHaveAttribute('aria-selected', 'true');
    await expect(window.getByRole('heading', { name: 'Work items' })).toBeVisible();
    await overviewTab.click();

    const projectTrigger = window.getByLabel('Projeto');
    await projectTrigger.click();
    await expect(window.getByRole('listbox')).toBeVisible();
    await window.getByRole('option', { name: 'Projeto Teste' }).click();
    await expect(projectTrigger).toContainText('Projeto Teste');

    const separators = await window.locator('.card-divider').evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return { height: style.height, background: style.backgroundColor };
      }),
    );
    expect(separators).toHaveLength(3);
    expect(separators.every((separator) => separator.height === '1px')).toBe(true);
    expect(
      separators.every(
        (separator) =>
          separator.background.startsWith('rgba(16, 48, 83') && separator.background !== 'rgba(0, 0, 0, 0)',
      ),
    ).toBe(true);

    await window.getByRole('button', { name: 'Configurações' }).click();
    const dialog = window.getByRole('dialog', { name: 'Configurações' });
    await expect(dialog).toBeVisible();
    expect(
      await window.evaluate(() => {
        const content = document.querySelector('.modal-content');
        const active = document.activeElement;
        return Boolean(content && active && content.contains(active));
      }),
    ).toBe(true);

    await window.keyboard.press('Shift+Tab');
    expect(
      await window.evaluate(() => {
        const content = document.querySelector('.modal-content');
        const active = document.activeElement;
        return Boolean(content && active && content.contains(active));
      }),
    ).toBe(true);

    await window.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(window.getByRole('button', { name: 'Configurações' })).toBeFocused();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
