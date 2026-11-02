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

test('Overview preenchido não tem violações de acessibilidade', async ({}, testInfo) => {
  const userData = testInfo.outputPath('user-data-overview-a11y');
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
          workItems: {
            ok: true,
            stale: false,
            fetchedAt: new Date().toISOString(),
            data: [
              {
                id: 145672,
                type: 'Bug',
                title: 'Título do Work Item',
                state: 'Backlog',
                project: 'Projeto Teste',
                assignedTo: 'Ericles Ribeiro',
                changedAt: '2026-11-02T10:00:00.000Z',
                url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/145672',
              },
            ],
          },
          pullRequest: {
            ok: true,
            stale: false,
            fetchedAt: new Date().toISOString(),
            data: {
              id: 5378,
              title: 'Refatorar o cliente',
              status: 'Aguardando aprovação',
              project: 'Projeto Teste',
              createdAt: '2026-11-02T10:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_git/repo/pullrequest/5378',
            },
          },
          pipeline: {
            ok: true,
            stale: false,
            fetchedAt: new Date().toISOString(),
            data: {
              id: 99,
              name: 'Nightly',
              result: 'succeeded',
              status: 'completed',
              project: 'Projeto Teste',
              startedAt: '2026-11-02T10:00:00.000Z',
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_build/results?buildId=99',
            },
          },
          fetchedAt: new Date().toISOString(),
          stale: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await expect(window.getByRole('heading', { name: 'Work items' })).toBeVisible();

    await window.evaluate(axe.source);
    const results = await window.evaluate(async () => {
      const pageWindow = window as unknown as AxeWindow;
      return pageWindow.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
    });

    expect(results.violations).toEqual([]);
  } finally {
    await app.close();
  }
});
