import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

const workItems = Array.from({ length: 10 }, (_, index) => ({
  id: 1001 + index,
  type: index % 2 === 0 ? 'Bug' : 'Task',
  title: `Work item ${index + 1}`,
  state: 'Active',
  project: 'Projeto Teste',
  assignedTo: 'Ericles Ribeiro',
  changedAt: `2026-11-${String(20 - index).padStart(2, '0')}T10:00:00.000Z`,
  priority: index + 1,
  url: `https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/${1001 + index}`,
}));

const pullRequests = Array.from({ length: 10 }, (_, index) => ({
  id: 5001 + index,
  title: `Pull request ${index + 1}`,
  status: 'Ativo',
  project: 'Projeto Teste',
  createdAt: `2026-11-${String(20 - index).padStart(2, '0')}T10:00:00.000Z`,
  url: `https://dev.azure.com/demo/Projeto%20Teste/_git/repo/pullrequest/${5001 + index}`,
}));

const pipelines = Array.from({ length: 10 }, (_, index) => ({
  id: 9001 + index,
  name: `Pipeline ${index + 1}`,
  result: 'succeeded',
  status: 'completed',
  project: 'Projeto Teste',
  startedAt: `2026-11-${String(20 - index).padStart(2, '0')}T10:00:00.000Z`,
  url: `https://dev.azure.com/demo/Projeto%20Teste/_build/results?buildId=${9001 + index}`,
}));

test('Overview exibe 10 itens por card e rola o conteúdo mantendo cabeçalho e separador', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-overview-ten');
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
    await app.evaluate(
      ({ ipcMain }, payload) => {
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
            workItems: {
              ok: true,
              stale: false,
              fetchedAt: new Date().toISOString(),
              data: payload.workItems,
            },
            pullRequests: {
              ok: true,
              stale: false,
              fetchedAt: new Date().toISOString(),
              data: payload.pullRequests,
            },
            pipelines: {
              ok: true,
              stale: false,
              fetchedAt: new Date().toISOString(),
              data: payload.pipelines,
            },
            fetchedAt: new Date().toISOString(),
            stale: false,
          },
        }));
      },
      { workItems, pullRequests, pipelines },
    );

    const window = await app.firstWindow();
    await window.reload();

    await expect(window.getByRole('heading', { name: 'Work items' })).toBeVisible();
    await expect(window.locator('.card-item')).toHaveCount(30);
    await expect(window.locator('.radix-scroll-viewport')).toHaveCount(3);

    const metrics = await window.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('.radix-scroll-viewport')).map(
        (viewport) => ({
          clientHeight: viewport.clientHeight,
          scrollHeight: viewport.scrollHeight,
        }),
      ),
    );
    expect(metrics.every((metric) => metric.scrollHeight > metric.clientHeight)).toBe(true);

    const workItemsCard = window.locator('.overview-card').filter({
      has: window.getByRole('heading', { name: 'Work items' }),
    });
    await workItemsCard.locator('.radix-scroll-viewport').evaluate((viewport) => {
      viewport.scrollTop = viewport.scrollHeight;
    });

    await expect(window.getByText('Work item 10')).toBeInViewport();
    await expect(workItemsCard.getByRole('heading', { name: 'Work items' })).toBeVisible();
    await expect(workItemsCard.locator('.card-divider')).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
