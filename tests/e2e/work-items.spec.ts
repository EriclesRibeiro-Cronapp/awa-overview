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

test('abre Work items, mostra resumo, tabela e filtros', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-work-items');
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
      ipcMain.removeHandler('workItems:load');
      ipcMain.handle('workItems:load', async () => ({
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
              id: 213456,
              type: 'PBI',
              title: 'Nightly regression suite across all supported browsers and locales',
              state: 'Active',
              sprint: 'Sprint 1',
              assignedTo: 'Ericles',
              changedAt: '2026-11-02T10:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/213456',
            },
            {
              id: 213457,
              type: 'PBI',
              title: 'Backlog item',
              state: 'New',
              sprint: 'Sprint 1',
              assignedTo: 'Ana',
              changedAt: '2026-11-02T09:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/213457',
            },
            {
              id: 213458,
              type: 'Bug',
              title: 'Concluído item',
              state: 'Closed',
              sprint: 'Sprint 2',
              assignedTo: 'Ericles',
              changedAt: '2026-11-02T08:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/213458',
            },
            {
              id: 213459,
              type: 'Task',
              title: 'Em andamento item',
              state: 'Active',
              sprint: 'Sprint 2',
              assignedTo: 'Ana',
              changedAt: '2026-11-02T07:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/213459',
            },
          ],
          summary: { total: 4, backlog: 1, inProgress: 2, done: 1 },
          truncated: false,
          fetchedAt: '2026-11-02T10:00:00.000Z',
          stale: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await window.getByRole('tab', { name: 'Work items' }).click();
    await expect(window.getByRole('heading', { name: 'Work items' })).toBeVisible();

    await expect(window.getByText('1.234')).toHaveCount(0);
    await expect(window.locator('.work-items-summary-value')).toHaveText(['4', '1', '2', '1']);
    await expect(window.getByRole('cell', { name: 'Backlog', exact: true })).toBeVisible();
    await expect(window.getByRole('columnheader', { name: 'Título' })).toBeVisible();
    await expect(window.getByText('#213456')).toBeVisible();

    await window.evaluate(axe.source);
    const results = await window.evaluate(async () => {
      const pageWindow = window as unknown as AxeWindow;
      return pageWindow.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
    });
    expect(results.violations).toEqual([]);
    await expect(window).toHaveScreenshot('work-items-filled.png', {
      maxDiffPixelRatio: 0.02,
    });

    await window.getByRole('searchbox').fill('backlog');
    await expect(window.getByText('Backlog item')).toBeVisible();
    await expect(window.getByText('Nightly regression suite across all supported browsers and locales')).toHaveCount(0);

    await window.getByRole('searchbox').fill('');
    await window.getByLabel('Status').selectOption('done');
    await expect(window.getByText('Concluído item')).toBeVisible();
    await expect(window.getByText('Nightly regression suite across all supported browsers and locales')).toHaveCount(0);
    await expect(window.locator('.work-items-summary-value')).toHaveText(['4', '1', '2', '1']);
  } finally {
    await app.close();
  }
});
