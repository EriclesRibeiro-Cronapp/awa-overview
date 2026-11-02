import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('primeira execução mantém o layout de referência', async ({}, testInfo) => {
  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${testInfo.outputPath(`user-data-visual-1793653960063`)}`],
  });

  try {
    const window = await app.firstWindow();
    await expect(window.getByRole('dialog')).toBeVisible();
    await expect(window).toHaveScreenshot('config-first-run.png', {
      maxDiffPixelRatio: 0.02,
    });
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
