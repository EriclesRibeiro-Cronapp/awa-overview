import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ConfigService, normalizeOrganization } from '../../src/main/services/config-service';

describe('ConfigService', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function makeDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), 'awa-config-'));
    dirs.push(dir);
    return dir;
  }

  it('normaliza a organização', () => {
    expect(normalizeOrganization('  Minha-Org  ')).toBe('minha-org');
  });

  it('rejeita organização inválida', () => {
    expect(() => normalizeOrganization('a')).toThrow();
    expect(() => normalizeOrganization('-org')).toThrow();
  });

  it('persiste organização, status e seleção', async () => {
    const service = new ConfigService(await makeDir());
    await service.setOrganization('demo');

    let config = await service.get();
    expect(config.normalizedOrganization).toBe('demo');
    expect(config.status).toBe('configured');

    await service.setSelection({ projectId: 'p1', teamId: 't1' });
    config = await service.get();
    expect(config.selectedProjectId).toBe('p1');
    expect(config.selectedTeamId).toBe('t1');

    await service.reset();
    config = await service.get();
    expect(config.status).toBe('unconfigured');
    expect(config.organization).toBeNull();
  });

  it('marca status inválido sem apagar a organização', async () => {
    const service = new ConfigService(await makeDir());
    await service.setOrganization('demo');
    await service.setStatus('invalid');

    const config = await service.get();
    expect(config.organization).toBe('demo');
    expect(config.status).toBe('invalid');
  });

  it('mantém a seleção anterior quando só o projeto muda', async () => {
    const service = new ConfigService(await makeDir());
    await service.setSelection({ projectId: 'p1', teamId: 't1' });
    await service.setSelection({ projectId: 'p2' });

    const config = await service.get();
    expect(config.selectedProjectId).toBe('p2');
    expect(config.selectedTeamId).toBe('t1');
  });

  it('ignora arquivo de configuração corrompido', async () => {
    const dir = await makeDir();
    await writeFile(join(dir, 'config.json'), '{invalid', 'utf8');
    const service = new ConfigService(dir);

    const config = await service.get();
    expect(config.status).toBe('unconfigured');
  });
});
