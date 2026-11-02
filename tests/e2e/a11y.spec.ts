import { test, expect, _electron as electron } from '@playwright/test';
import axe from 'axe-core';
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

test('primeira execução não tem violações de acessibilidade', async ({}, testInfo) => {
  const app = await electron.launch({
    args: [mainEntry, `--user-data-dir=${testInfo.outputPath('user-data-a11y')}`],
  });

  try {
    const window = await app.firstWindow();
    await expect(window.getByRole('dialog')).toBeVisible();

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
