import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('seleciona projeto, carrega times e mostra staleness', async ({}, testInfo) => {
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
        stale: true,
        fetchedAt: new Date().toISOString(),
      }));

      ipcMain.removeHandler('teams:list');
      ipcMain.handle('teams:list', async (_event: unknown, input: { projectId: string }) => ({
        ok: true,
        items: [{ id: 't1', name: 'Time A', projectId: input.projectId }],
        stale: false,
        fetchedAt: new Date().toISOString(),
      }));
    });

    const window = await app.firstWindow();
    await expect(window.getByRole('button', { name: 'Configurações' })).toBeVisible();

    const retry = window.getByRole('button', { name: 'Tentar novamente' });
    if ((await retry.count()) > 0) await retry.click();

    await expect(window.getByLabel('Projeto')).toBeVisible();
    await window.getByLabel('Projeto').selectOption('p1');
    await expect(window.getByLabel('Time')).toBeVisible();
    await window.getByLabel('Time').selectOption('t1');

    await expect(window.getByText('Dados desatualizados')).toBeVisible();
  } finally {
    await app.close();
  }
});
