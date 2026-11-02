import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  PullRequestsCacheService,
  type PullRequestsSnapshot,
} from '../../src/main/services/pull-requests-cache-service';

const keyProvider = {
  getKey: async () => Buffer.alloc(32, 6),
  clear: async () => undefined,
};

const snapshot: PullRequestsSnapshot = {
  schemaVersion: 1,
  contextKey: 'demo|p1',
  organization: 'demo',
  projectId: 'p1',
  projectName: 'Projeto',
  teamId: null,
  teamName: null,
  fetchedAt: new Date().toISOString(),
  ttlSeconds: 300,
  items: [],
  truncated: false,
};

describe('PullRequestsCacheService', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function cache() {
    const dir = await mkdtemp(join(tmpdir(), 'awa-pull-requests-cache-'));
    dirs.push(dir);
    return new PullRequestsCacheService(dir, keyProvider);
  }

  it('grava, lê e limpa', async () => {
    const service = await cache();
    await service.write(snapshot);
    expect((await service.read())?.contextKey).toBe('demo|p1');
    await service.clear();
    expect(await service.read()).toBeNull();
  });

  it('considera stale após o TTL', async () => {
    const service = await cache();
    const value = { ...snapshot, fetchedAt: '2026-11-02T10:00:00.000Z' };
    expect(service.isFresh(value, Date.parse('2026-11-02T10:04:59.000Z'))).toBe(true);
    expect(service.isFresh(value, Date.parse('2026-11-02T10:05:00.000Z'))).toBe(false);
  });
});
