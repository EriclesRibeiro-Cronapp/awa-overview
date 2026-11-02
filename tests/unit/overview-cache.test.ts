import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { OverviewCacheService, type OverviewSnapshot } from '../../src/main/services/overview-cache-service';

const keyProvider = {
  getKey: async () => Buffer.alloc(32, 7),
  clear: async () => undefined,
};

function snapshot(overrides: Partial<OverviewSnapshot> = {}): OverviewSnapshot {
  return {
    schemaVersion: 1,
    contextKey: 'demo|p1|t1',
    organization: 'demo',
    projectId: 'p1',
    projectName: 'Projeto',
    teamId: 't1',
    teamName: 'Time',
    fetchedAt: new Date().toISOString(),
    ttlSeconds: 300,
    workItems: [],
    pullRequest: null,
    pipeline: null,
    ...overrides,
  };
}

describe('OverviewCacheService', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it('grava, lê e limpa o snapshot cifrado', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'awa-overview-cache-'));
    dirs.push(dir);
    const cache = new OverviewCacheService(dir, keyProvider);

    await cache.write(snapshot());
    const loaded = await cache.read();
    expect(loaded?.contextKey).toBe('demo|p1|t1');

    await cache.clear();
    expect(await cache.read()).toBeNull();
  });

  it('considera stale após o TTL', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'awa-overview-cache-'));
    dirs.push(dir);
    const cache = new OverviewCacheService(dir, keyProvider);
    const value = snapshot({ fetchedAt: '2026-11-02T10:00:00.000Z' });

    expect(cache.isFresh(value, Date.parse('2026-11-02T10:04:59.000Z'))).toBe(true);
    expect(cache.isFresh(value, Date.parse('2026-11-02T10:05:00.000Z'))).toBe(false);
  });

  it('ignora schema desconhecido', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'awa-overview-cache-'));
    dirs.push(dir);
    const cache = new OverviewCacheService(dir, keyProvider);
    await cache.write(snapshot({ schemaVersion: 2 as unknown as 1 }));

    expect(await cache.read()).toBeNull();
  });
});
