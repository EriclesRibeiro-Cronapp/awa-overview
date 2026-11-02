import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CacheSnapshot } from '@shared/contracts';
import { CacheService, type CacheKeyProvider } from '../../src/main/services/cache-service';

function keyProvider(): CacheKeyProvider {
  const key = randomBytes(32);
  return {
    getKey: async () => key,
    clear: async () => undefined,
  };
}

const snapshot: CacheSnapshot = {
  schemaVersion: 1,
  organization: 'demo',
  projects: [{ id: 'p1', name: 'Projeto', state: 'wellFormed' }],
  teamsByProject: { p1: [{ id: 't1', name: 'Time', projectId: 'p1' }] },
  fetchedAt: new Date().toISOString(),
  ttlSeconds: 900,
};

describe('CacheService', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function makeDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), 'awa-cache-'));
    dirs.push(dir);
    return dir;
  }

  it('grava e lê o snapshot cifrado', async () => {
    const dir = await makeDir();
    const service = new CacheService(dir, keyProvider());

    await service.write(snapshot);
    const read = await service.read();

    expect(read).toEqual(snapshot);
    expect(service.isFresh(read as CacheSnapshot)).toBe(true);
  });

  it('retorna null para cache inexistente', async () => {
    const service = new CacheService(await makeDir(), keyProvider());
    expect(await service.read()).toBeNull();
  });

  it('retorna null para cache corrompido', async () => {
    const dir = await makeDir();
    const service = new CacheService(dir, keyProvider());
    await service.write(snapshot);
    await writeFile(join(dir, 'cache.json.enc'), '{"schemaVersion":1,"iv":"x"}', 'utf8');

    expect(await service.read()).toBeNull();
  });

  it('limpa o cache', async () => {
    const dir = await makeDir();
    const service = new CacheService(dir, keyProvider());
    await service.write(snapshot);
    await service.clear();

    expect(await service.read()).toBeNull();
  });
});
