import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('seleciona projeto e time e carrega o Overview', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-projects');
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

  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${userData}`],
  });

  try {
    await app.evaluate(({ ipcMain }) => {
      ipcMain.removeHandler('projects:list');
      ipcMain.handle('projects:list', async () => ({
        ok: true,
        items: [
          { id: 'p1', name: 'Projeto Um', state: 'wellFormed' },
          { id: 'p2', name: 'Projeto Dois', state: 'wellFormed' },
        ],
        stale: false,
        fetchedAt: new Date().toISOString(),
      }));

      ipcMain.removeHandler('teams:list');
      ipcMain.handle('teams:list', async (_event: unknown, input: { projectId: string }) => ({
        ok: true,
        items: [{ id: 't1', name: 'Time A', projectId: input.projectId }],
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
            projectName: 'Projeto Um',
            teamId: 't1',
            teamName: 'Time A',
          },
          workItems: {
            ok: true,
            stale: false,
            fetchedAt: new Date().toISOString(),
            data: [
              {
                id: 145672,
                type: 'Bug',
                title: 'Item do projeto',
                state: 'Active',
                project: 'Projeto Um',
                assignedTo: 'Ericles',
                changedAt: '2026-11-02T10:00:00.000Z',
                url: 'https://dev.azure.com/demo/Projeto%20Um/_workitems/edit/145672',
              },
            ],
          },
          pullRequest: {
            ok: true,
            stale: false,
            fetchedAt: new Date().toISOString(),
            data: null,
          },
          pipeline: {
            ok: true,
            stale: false,
            fetchedAt: new Date().toISOString(),
            data: null,
          },
          fetchedAt: new Date().toISOString(),
          stale: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await expect(window.getByRole('button', { name: 'Configurações' })).toBeVisible();

    await expect(window.getByLabel('Projeto')).toBeVisible();
    await window.getByLabel('Projeto').selectOption('p1');
    await expect(window.getByLabel('Time')).toBeVisible();
    await window.getByLabel('Time').selectOption('t1');

    await expect(window.getByText('#145672')).toBeVisible();
  } finally {
    await app.close();
  }
});
