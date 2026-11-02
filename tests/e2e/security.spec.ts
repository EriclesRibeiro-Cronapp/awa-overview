import { test, expect, _electron as electron } from '@playwright/test';
import { join } from 'node:path';

const mainEntry = join(process.cwd(), 'out/main/index.js');

test('renderer roda com isolamento e sem Node', async ({}, testInfo) => {
  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${testInfo.outputPath(`user-data-security-1793653960062`)}`],
  });

    await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const window = await app.firstWindow();
    await window.reload();
    const preferences = await app.evaluate(({ BrowserWindow }) => {
      const [window] = BrowserWindow.getAllWindows();
      const contents = window.webContents as unknown as {
        getLastWebPreferences: () => Record<string, unknown>;
      };
      return contents.getLastWebPreferences();
    });

    expect(preferences.contextIsolation).toBe(true);
    expect(preferences.nodeIntegration).toBe(false);
    expect(preferences.sandbox).toBe(true);

    const nodeVisible = await window.evaluate(() => 'require' in window);
    expect(nodeVisible).toBe(false);
  } finally {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
});
