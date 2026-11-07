import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

const workItems = Array.from({ length: 10 }, (_, index) => ({
  id: 2001 + index,
  type: 'Bug',
  title: `Item ${index + 1}`,
  state: 'Active',
  project: 'Projeto Teste',
  assignedTo: 'Ericles',
  changedAt: `2026-11-${String(20 - index).padStart(2, '0')}T10:00:00.000Z`,
  priority: 1,
  url: `https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/${2001 + index}`,
}));

test('Overview com 10 itens renderiza dentro do orçamento', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-overview-radix-perf');
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
      ({ ipcMain }, items) => {
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
              data: items,
            },
            pullRequests: {
              ok: true,
              stale: false,
              fetchedAt: new Date().toISOString(),
              data: [],
            },
            pipelines: {
              ok: true,
              stale: false,
              fetchedAt: new Date().toISOString(),
              data: [],
            },
            fetchedAt: new Date().toISOString(),
            stale: false,
          },
        }));
      },
      workItems,
    );

    const window = await app.firstWindow();
    const start = Date.now();
    await window.reload();
    await expect(window.getByText('#2001')).toBeVisible({ timeout: 5_000 });
    await expect(window.locator('.card-item')).toHaveCount(10);

    expect(Date.now() - start).toBeLessThan(5_000);

    await window.locator('.radix-scroll-viewport').first().evaluate((viewport) => {
      viewport.scrollTop = viewport.scrollHeight;
    });
    await expect(window.getByText('Item 10')).toBeInViewport();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
