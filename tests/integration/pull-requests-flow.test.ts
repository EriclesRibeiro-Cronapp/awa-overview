import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PullRequestTableRow } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import { PullRequestsCacheService } from '../../src/main/services/pull-requests-cache-service';
import { PullRequestsService } from '../../src/main/services/pull-requests-service';

const keyProvider = {
  getKey: async () => Buffer.alloc(32, 8),
  clear: async () => undefined,
};

const row: PullRequestTableRow = {
  id: 1,
  title: 'PR',
  status: 'active',
  project: 'Projeto',
  createdAt: '2026-11-02T10:00:00.000Z',
  url: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/1',
};

const input = {
  organization: 'demo',
  pat: 'pat',
  projectId: 'p1',
  projectName: 'Projeto',
  teamId: null,
  teamName: null,
  force: false,
};

function client(overrides: Record<string, unknown> = {}) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
    listPullRequests: vi.fn(async () => ({ items: [row], truncated: false })),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

describe('Pull requests flow', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function cache() {
    const dir = await mkdtemp(join(tmpdir(), 'awa-pull-requests-flow-'));
    dirs.push(dir);
    return new PullRequestsCacheService(dir, keyProvider);
  }

  it('grava e reutiliza o snapshot', async () => {
    const pullRequestsCache = await cache();
    const fake = client();
    const service = new PullRequestsService(fake, pullRequestsCache);

    await service.load(input);
    await service.load(input);

    expect(fake.listPullRequests).toHaveBeenCalledOnce();
    expect((await pullRequestsCache.read())?.items).toHaveLength(1);
  });

  it('usa cache stale quando a consulta falha', async () => {
    const pullRequestsCache = await cache();
    await new PullRequestsService(client(), pullRequestsCache).load(input);

    const failing = new PullRequestsService(
      client({
        listPullRequests: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
        }),
      }),
      pullRequestsCache,
    );

    const view = await failing.load({ ...input, force: true });
    expect(view.stale).toBe(true);
    expect(view.items).toHaveLength(1);
  });
});
