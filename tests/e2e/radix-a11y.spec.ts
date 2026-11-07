import { test, expect, _electron as electron, type Page } from '@playwright/test';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

type AxeWindow = Window & {
  axe: {
    run: (
      context?: Document,
      options?: { runOnly?: string[] },
    ) => Promise<{ violations: Array<{ id: string; help: string }> }>;
  };
};

async function audit(window: Page) {
  const results = await window.evaluate(async () => {
    const pageWindow = window as unknown as AxeWindow;
    return pageWindow.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
  });
  expect(results.violations).toEqual([]);
}

test('Dialog, Select e Tabs não introduzem violações axe', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-radix-a11y');
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
    await window.evaluate(axe.source);

    await window.getByRole('button', { name: 'Configurações' }).click();
    await expect(window.getByRole('dialog', { name: 'Configurações' })).toBeVisible();
    await audit(window);
    await window.keyboard.press('Escape');

    await window.getByLabel('Projeto').click();
    await expect(window.getByRole('listbox')).toBeVisible();
    await audit(window);
    await window.keyboard.press('Escape');

    await window.getByRole('tab', { name: 'Work items' }).click();
    await expect(window.getByRole('tab', { name: 'Work items' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await audit(window);
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
