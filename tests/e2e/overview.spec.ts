import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

const workItem = {
  id: 145672,
  type: 'Bug',
  title: 'Título do Work Item',
  state: 'Backlog',
  project: 'Projeto Teste',
  assignedTo: 'Ericles Ribeiro',
  changedAt: '2026-11-02T10:00:00.000Z',
  priority: 2,
  url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/145672',
};

const pullRequest = {
  id: 5378,
  title: 'Refatorar o cliente',
  status: 'Aguardando aprovação',
  project: 'Projeto Teste',
  createdAt: '2026-11-02T10:00:00.000Z',
  url: 'https://dev.azure.com/demo/Projeto%20Teste/_git/repo/pullrequest/5378',
};

const pipeline = {
  id: 99,
  name: 'Nightly',
  result: 'succeeded',
  status: 'completed',
  project: 'Projeto Teste',
  startedAt: '2026-11-02T10:00:00.000Z',
  url: 'https://dev.azure.com/demo/Projeto%20Teste/_build/results?buildId=99',
};

async function launchConfigured(
  testInfo: { outputPath: (name: string) => string },
  selectedProjectId: string | null = 'p1',
) {
  const userData = testInfo.outputPath(`user-data-overview-${selectedProjectId ?? 'none'}`);
  await mkdir(userData, { recursive: true });
  await writeFile(
    join(userData, 'config.json'),
    JSON.stringify({
      schemaVersion: 1,
      organization: 'demo',
      normalizedOrganization: 'demo',
      status: 'configured',
      lastValidatedAt: '2026-11-02T00:00:00.000Z',
      selectedProjectId,
      selectedTeamId: selectedProjectId ? 't1' : null,
    }),
    'utf8',
  );

  const app = await electron.launch({ args: [mainEntry, `--user-data-dir=${userData}`] });

    await new Promise((resolve) => setTimeout(resolve, 500));

  await app.evaluate(({ ipcMain }, payload) => {
    const { projectId, workItem, pullRequest, pipeline } = payload;
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

    if (!projectId) return;

    let call = 0;
    ipcMain.removeHandler('overview:load');
    ipcMain.handle('overview:load', async () => {
      call += 1;
      const items = call === 1 ? [workItem] : [workItem, { ...workItem, id: 145673 }];
      return {
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
            data: [pullRequest],
          },
          pipelines: {
            ok: true,
            stale: false,
            fetchedAt: new Date().toISOString(),
            data: [pipeline],
          },
          fetchedAt: new Date().toISOString(),
          stale: false,
        },
      };
    });
  }, { projectId: selectedProjectId, workItem, pullRequest, pipeline });

  return app;
}

test('mostra os três cards, atualiza e exibe staleness', async ({}, testInfo) => {
  const start = Date.now();
  const app = await launchConfigured(testInfo);

  try {
    const window = await app.firstWindow();
    await window.reload();
    await expect(window.getByRole('heading', { name: 'Work items' })).toBeVisible();
    expect(Date.now() - start).toBeLessThan(5_000);
    await expect(window.getByText('#145672')).toBeVisible();
    await expect(window.getByText('Nightly')).toBeVisible();
    await expect(window.getByText('!5378')).toBeVisible();

    await window.getByRole('button', { name: 'Atualizar' }).click();
    await expect(window.getByText('#145673')).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});

test('mostra as mensagens vazias documentadas', async ({}, testInfo) => {
  const app = await launchConfigured(testInfo);

  try {
    await app.evaluate(({ ipcMain }) => {
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
            data: [],
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
          stale: true,
        },
      }));
    });

    const window = await app.firstWindow();
    await window.reload();
    await expect(
      window.getByText('No work items are assigned to you in this view.'),
    ).toBeVisible();
    await expect(
      window.getByText('No open pull requests need your attention.'),
    ).toBeVisible();
    await expect(
      window.getByText('No recent pipeline runs were found for your projects.'),
    ).toBeVisible();
    await expect(window.getByText('Dados desatualizados')).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});

test('orienta a selecionar um projeto quando não há contexto', async ({}, testInfo) => {
  const app = await launchConfigured(testInfo, null);

  try {
    const window = await app.firstWindow();
    await window.reload();
    await expect(
      window.getByRole('heading', { name: 'Selecione um projeto' }),
    ).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
