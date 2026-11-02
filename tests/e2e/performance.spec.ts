import { test, expect, _electron as electron } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('primeira execução fica pronta dentro do orçamento', async ({}, testInfo) => {
  const start = Date.now();
  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${testInfo.outputPath(`user-data-perf-start-1793653960061`)}`],
  });

    await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const window = await app.firstWindow();
    await window.reload();
    await expect(window.getByLabel('Organização')).toBeVisible({ timeout: 10_000 });
    expect(Date.now() - start).toBeLessThan(10_000);
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});

test('renderiza 100 projetos em menos de 5 segundos', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-perf-projects-1793653960061`);
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

  const projects = Array.from({ length: 100 }, (_, index) => ({
    id: `p${index}`,
    name: `Projeto ${index}`,
    state: 'wellFormed',
  }));

  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${userData}`],
  });

  try {
    await app.evaluate(({ ipcMain }, list) => {
      ipcMain.removeHandler('projects:list');
      ipcMain.handle('projects:list', async () => ({
        ok: true,
        items: list,
        stale: false,
        fetchedAt: new Date().toISOString(),
      }));
    }, projects);

    const window = await app.firstWindow();
    await window.reload();
    const start = Date.now();
    await expect(window.getByLabel('Projeto')).toBeVisible({ timeout: 10_000 });
    await expect(window.getByLabel('Projeto').locator('option')).toHaveCount(101);

    expect(Date.now() - start).toBeLessThan(5_000);
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});
