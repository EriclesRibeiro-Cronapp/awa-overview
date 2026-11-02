import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('primeira execução mostra configuração e ajuda do PAT', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-1793653960060`);
  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${userData}`],
  });

    await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const window = await app.firstWindow();
    await window.reload();
    await expect(window.getByRole('dialog')).toBeVisible();
    await expect(window.getByText('Configuração necessária')).toBeVisible();

    await window.getByText('Como criar e revogar o PAT').click();
    await expect(window.getByText(/Personal access tokens/)).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});

test('mostra erro de PAT inválido sem fechar a modal', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-invalid-1793653960060`);
  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${userData}`],
  });

  try {
    await app.evaluate(({ ipcMain }) => {
      ipcMain.removeHandler('config:save');
      ipcMain.handle('config:save', async () => ({
        ok: false,
        error: {
          code: 'CFG-003',
          message: 'O token é inválido ou expirou.',
          retryable: false,
        },
      }));
    });

    const window = await app.firstWindow();
    await window.reload();
    await window.getByLabel('Organização').fill('demo');
    await window.getByLabel('Personal Access Token').fill('bad');
    await window.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();

    await expect(window.getByRole('alert')).toContainText('O token é inválido ou expirou.');
    await expect(window.getByRole('dialog')).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});

test('salva configuração válida quando credenciais de teste são fornecidas', async ({}, testInfo) => {
  const organization = process.env.AWA_E2E_ORG;
  const pat = process.env.AWA_E2E_PAT;
  test.skip(!organization || !pat, 'Defina AWA_E2E_ORG e AWA_E2E_PAT para o teste feliz');

  const userData = testInfo.outputPath(`user-data-valid-1793653960060`);
  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${userData}`],
  });

  try {
    const window = await app.firstWindow();
    await window.reload();
    await window.getByLabel('Organização').fill(organization as string);
    await window.getByLabel('Personal Access Token').fill(pat as string);
    await window.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();

    await expect(window.getByRole('dialog')).toBeHidden({ timeout: 20_000 });
    await expect(window.getByText(organization as string)).toBeVisible();
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
