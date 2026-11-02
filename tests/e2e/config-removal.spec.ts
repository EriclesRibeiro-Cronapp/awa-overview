import { test, expect, _electron as electron } from '@playwright/test';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('remove a configuração e volta ao estado inicial', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-removal-1793653960060`);
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

  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${userData}`],
  });

  try {
    const window = await app.firstWindow();
    await window.getByRole('button', { name: 'Configurações' }).click();
    await window.getByRole('button', { name: 'Remover configuração' }).click();

    await expect(window.getByText(/Tem certeza/)).toBeVisible();
    await window.getByRole('button', { name: 'Remover', exact: true }).click();

    await expect(window.getByLabel('Organização')).toHaveValue('');
    await expect(window.getByText('Configuração necessária')).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  await expect(access(join(userData, 'config.json'))).rejects.toBeTruthy();
});
