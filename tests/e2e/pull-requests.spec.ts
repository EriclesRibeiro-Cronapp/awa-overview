import { test, expect, _electron as electron } from '@playwright/test';
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

test('abre Pull requests, mostra tabela e filtros', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-pull-requests-1793653960062`);
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
          pullRequest: { ok: true, data: null, stale: false, fetchedAt: new Date().toISOString() },
          pipeline: { ok: true, data: null, stale: false, fetchedAt: new Date().toISOString() },
          fetchedAt: new Date().toISOString(),
          stale: false,
        },
      }));
      ipcMain.removeHandler('pullRequests:load');
      ipcMain.handle('pullRequests:load', async () => ({
        ok: true,
        data: {
          context: {
            organization: 'demo',
            projectId: 'p1',
            projectName: 'Projeto Teste',
            teamId: 't1',
            teamName: 'Time A',
          },
          items: [
            {
              id: 54678,
              title: 'Refatorar o cliente do Azure DevOps',
              status: 'active',
              project: 'Projeto Teste',
              createdAt: '2026-11-02T10:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_git/repo/pullrequest/54678',
            },
            {
              id: 54679,
              title: 'Concluído item',
              status: 'completed',
              project: 'Projeto Teste',
              createdAt: '2026-11-01T10:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_git/repo/pullrequest/54679',
            },
            {
              id: 54680,
              title: 'Abandonado item',
              status: 'abandoned',
              project: 'Projeto Teste',
              createdAt: '2026-10-31T10:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_git/repo/pullrequest/54680',
            },
          ],
          truncated: false,
          fetchedAt: '2026-11-02T10:00:00.000Z',
          stale: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await window.getByRole('tab', { name: 'Pull requests' }).click();
    await expect(window.getByRole('heading', { name: 'Pull requests' })).toBeVisible();

    await expect(window.getByRole('columnheader', { name: 'Título' })).toBeVisible();
    const table = window.getByRole('region', { name: 'Tabela de pull requests' });
    await expect(table.getByText('!54678')).toBeVisible();
    await expect(table.getByText('Aberto', { exact: true })).toBeVisible();
    await expect(table.getByText('Concluído', { exact: true })).toBeVisible();
    await expect(table.getByText('Abandonado', { exact: true })).toBeVisible();

    await window.evaluate(axe.source);
    const results = await window.evaluate(async () => {
      const pageWindow = window as unknown as AxeWindow;
      return pageWindow.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
    });
    expect(results.violations).toEqual([]);
    await expect(window).toHaveScreenshot('pull-requests-filled.png', {
      maxDiffPixelRatio: 0.02,
    });

    await window.getByRole('searchbox').fill('!54678');
    await expect(window.getByText('!54678')).toBeVisible();
    await expect(window.getByText('!54679')).toHaveCount(0);

    await window.getByRole('searchbox').fill('');
    await window.getByLabel('Status').selectOption('completed');
    await expect(window.getByText('!54679')).toBeVisible();
    await expect(window.getByText('!54678')).toHaveCount(0);
  } finally {
    await app.close();
  }
});
