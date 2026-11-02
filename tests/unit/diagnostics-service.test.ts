import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { DiagnosticsService } from '../../src/main/services/diagnostics-service';

describe('DiagnosticsService', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('exporta diagnóstico redigido, sem PAT', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'awa-diagnostics-'));
    dirs.push(dir);
    const logPath = join(dir, 'main.log');
    await writeFile(
      logPath,
      'info config.saved\nAuthorization: Basic ZmlnZF9zZWNyZXQ=\nfigd_supersecret\n',
      'utf8',
    );

    const service = new DiagnosticsService(dir, logPath, async () => ({
      appVersion: '0.1.0',
      platform: 'win32',
      organization: 'demo',
      status: 'configured',
      integrations: { azureDevOps: 'not-checked' },
    }));

    const filePath = await service.export();
    const content = await readFile(filePath, 'utf8');

    expect(content).toContain('"organization": "demo"');
    expect(content).not.toContain('figd_supersecret');
    expect(content).not.toContain('ZmlnZF9zZWNyZXQ=');
    expect(content).toContain('[REDACTED_PAT]');
  });
});
