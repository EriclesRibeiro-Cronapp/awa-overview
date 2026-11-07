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

test('abre Pipelines, mostra status, duração e busca', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-pipelines-${Date.now()}`);
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
      ipcMain.removeHandler('pipelines:load');
      ipcMain.handle('pipelines:load', async () => ({
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
              id: 99,
              name: 'Nightly',
              description: 'Nightly regression suite',
              result: 'succeeded',
              status: 'completed',
              project: 'Projeto Teste',
              startedAt: '2026-11-02T10:00:00.000Z',
              finishedAt: '2026-11-02T10:00:51.000Z',
              durationSeconds: 51,
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_build/results?buildId=99',
            },
            {
              id: 100,
              name: 'Deploy',
              description: 'Produção',
              result: 'failed',
              status: 'completed',
              project: 'Projeto Teste',
              startedAt: '2026-11-02T09:00:00.000Z',
              finishedAt: '2026-11-02T09:02:03.000Z',
              durationSeconds: 123,
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_build/results?buildId=100',
            },
            {
              id: 101,
              name: 'Em andamento pipeline',
              description: 'Execução atual',
              result: 'unknown',
              status: 'inProgress',
              project: 'Projeto Teste',
              startedAt: '2026-11-02T11:00:00.000Z',
              finishedAt: null,
              durationSeconds: null,
              url: 'https://dev.azure.com/demo/Projeto%20Teste/_build/results?buildId=101',
            },
          ],
          truncated: false,
          fetchedAt: '2026-11-02T10:00:00.000Z',
          stale: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await window.reload();
    await window.getByRole('tab', { name: 'Pipelines' }).click();
    await expect(window.getByRole('heading', { name: 'Pipelines' })).toBeVisible();

    const table = window.getByRole('region', { name: 'Tabela de pipelines' });
    await expect(table.getByText('Nightly', { exact: true })).toBeVisible();
    await expect(table.getByText('Nightly regression suite')).toBeVisible();
    await expect(table.getByText('51s')).toBeVisible();
    await expect(table.getByText('2m 3s')).toBeVisible();
    await expect(table.getByRole('img', { name: 'Sucesso' })).toBeVisible();
    await expect(table.getByRole('img', { name: 'Falha' })).toBeVisible();
    await expect(table.getByRole('img', { name: 'Em andamento' })).toBeVisible();

    await window.evaluate(axe.source);
    const results = await window.evaluate(async () => {
      const pageWindow = window as unknown as AxeWindow;
      return pageWindow.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
    });
    expect(results.violations).toEqual([]);
    await expect(window).toHaveScreenshot('pipelines-filled.png', {
      maxDiffPixelRatio: 0.02,
    });

    await window.getByRole('searchbox').fill('deploy');
    await expect(table.getByText('Deploy')).toBeVisible();
    await expect(table.getByText('Nightly')).toHaveCount(0);

    await window.getByRole('searchbox').fill('inexistente');
    await expect(window.getByText('Nenhum pipeline corresponde à busca.')).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
