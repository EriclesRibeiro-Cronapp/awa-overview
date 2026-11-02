import { test, expect, _electron as electron, type ElectronApplication } from '@playwright/test';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('segunda instância não abre outra janela', async ({}, testInfo) => {
  const userData = testInfo.outputPath(`user-data-single-1793653960062`);
  const first = await electron.launch({
    args: [mainEntry, `--user-data-dir=${userData}`],
  });

  let second: ElectronApplication | null = null;

  try {
    await first.firstWindow();

    try {
      second = await electron.launch({
        args: [mainEntry, `--user-data-dir=${userData}`],
      });
    } catch {
      second = null;
    }

    if (second) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(second.windows()).toHaveLength(0);
    }
  } finally {
    await second?.close().catch(() => undefined);
    await first.close();
  }
});
