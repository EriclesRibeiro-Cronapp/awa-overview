import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('Overview preenchido mantém o layout de referência', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-overview-visual-1793653960061`);
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
        fetchedAt: '2026-11-02T10:00:00.000Z',
      }));
      ipcMain.removeHandler('teams:list');
      ipcMain.handle('teams:list', async () => ({
        ok: true,
        items: [{ id: 't1', name: 'Time A', projectId: 'p1' }],
        stale: false,
        fetchedAt: '2026-11-02T10:00:00.000Z',
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
            fetchedAt: '2026-11-02T10:00:00.000Z',
            data: [
              {
                id: 145672,
                type: 'Bug',
                title: 'Título do Work Item',
                state: 'Backlog',
                project: 'Projeto Teste',
                assignedTo: 'Ericles Ribeiro',
                changedAt: '2026-11-02T10:00:00.000Z',
                priority: 2,
                url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/145672',
              },
            ],
          },
          pullRequests: {
            ok: true,
            stale: false,
            fetchedAt: '2026-11-02T10:00:00.000Z',
            data: [
              {
                id: 5378,
                title: 'Refatorar o cliente',
                status: 'Aguardando aprovação',
                project: 'Projeto Teste',
                createdAt: '2026-11-02T10:00:00.000Z',
                url: 'https://dev.azure.com/demo/Projeto%20Teste/_git/repo/pullrequest/5378',
              },
            ],
          },
          pipelines: {
            ok: true,
            stale: false,
            fetchedAt: '2026-11-02T10:00:00.000Z',
            data: [
              {
                id: 99,
                name: 'Nightly',
                result: 'succeeded',
                status: 'completed',
                project: 'Projeto Teste',
                startedAt: '2026-11-02T10:00:00.000Z',
                url: 'https://dev.azure.com/demo/Projeto%20Teste/_build/results?buildId=99',
              },
            ],
          },
          fetchedAt: '2026-11-02T10:00:00.000Z',
          stale: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await window.reload();
    await expect(window.getByRole('heading', { name: 'Work items' })).toBeVisible();
    await expect(window).toHaveScreenshot('overview-filled.png', {
      maxDiffPixelRatio: 0.02,
    });
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
