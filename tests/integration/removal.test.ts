import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CacheSnapshot } from '@shared/contracts';
import { CacheService, FileCacheKeyProvider } from '../../src/main/services/cache-service';
import { ConfigService } from '../../src/main/services/config-service';
import { removeConfiguration } from '../../src/main/services/config-removal';
import { CredentialsService } from '../../src/main/services/credentials-service';
import { OverviewCacheService } from '../../src/main/services/overview-cache-service';

const storage = {
  isAvailable: () => true,
  encryptString: (value: string) => Buffer.from(`enc:${value}`, 'utf8'),
  decryptString: (value: Buffer) => value.toString('utf8').replace(/^enc:/, ''),
};

const snapshot: CacheSnapshot = {
  schemaVersion: 1,
  organization: 'demo',
  projects: [{ id: 'p1', name: 'Projeto', state: 'wellFormed' }],
  teamsByProject: {},
  fetchedAt: new Date().toISOString(),
  ttlSeconds: 900,
};

describe('removal integration', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('não deixa PAT, cache nem chave após remover', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'awa-removal-'));
    dirs.push(dir);

    const config = new ConfigService(dir);
    const credentials = new CredentialsService(dir, storage);
    const cacheKey = new FileCacheKeyProvider(dir, storage);
    const cache = new CacheService(dir, cacheKey);
    const overviewCache = new OverviewCacheService(dir, cacheKey);

    await config.setOrganization('demo');
    await credentials.save('figd_secret_1234');
    await cache.write(snapshot);
    await overviewCache.write({
      schemaVersion: 1,
      contextKey: 'demo|p1|',
      organization: 'demo',
      projectId: 'p1',
      projectName: 'Projeto',
      teamId: null,
      teamName: null,
      fetchedAt: new Date().toISOString(),
      ttlSeconds: 300,
      workItems: [],
      pullRequest: null,
      pipeline: null,
    });
    await cacheKey.getKey();

    await removeConfiguration({ config, credentials, cache, cacheKey, overviewCache });

    expect((await config.get()).status).toBe('unconfigured');
    expect(await credentials.has()).toBe(false);
    expect(await cache.read()).toBeNull();
    expect(await overviewCache.read()).toBeNull();
    await expect(access(join(dir, 'cache.key'))).rejects.toBeTruthy();
  });
});
