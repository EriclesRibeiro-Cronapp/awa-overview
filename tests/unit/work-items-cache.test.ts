import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { WorkItemsCacheService, type WorkItemsSnapshot } from '../../src/main/services/work-items-cache-service';

const keyProvider = {
  getKey: async () => Buffer.alloc(32, 4),
  clear: async () => undefined,
};

const snapshot: WorkItemsSnapshot = {
  schemaVersion: 1,
  contextKey: 'demo|p1|t1',
  organization: 'demo',
  projectId: 'p1',
  projectName: 'Projeto',
  teamId: 't1',
  teamName: 'Time',
  fetchedAt: new Date().toISOString(),
  ttlSeconds: 300,
  items: [],
  truncated: false,
};

describe('WorkItemsCacheService', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function cache() {
    const dir = await mkdtemp(join(tmpdir(), 'awa-work-items-cache-'));
    dirs.push(dir);
    return new WorkItemsCacheService(dir, keyProvider);
  }

  it('grava, lê e limpa', async () => {
    const service = await cache();
    await service.write(snapshot);
    expect((await service.read())?.contextKey).toBe('demo|p1|t1');
    await service.clear();
    expect(await service.read()).toBeNull();
  });

  it('calcula frescor pelo TTL', async () => {
    const service = await cache();
    const value = { ...snapshot, fetchedAt: '2026-11-02T10:00:00.000Z' };
    expect(service.isFresh(value, Date.parse('2026-11-02T10:04:59.000Z'))).toBe(true);
    expect(service.isFresh(value, Date.parse('2026-11-02T10:05:00.000Z'))).toBe(false);
  });
});
