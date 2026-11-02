import { describe, expect, it, vi } from 'vitest';
import type { PullRequestTableRow } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import type {
  PullRequestsCacheService,
  PullRequestsSnapshot,
} from '../../src/main/services/pull-requests-cache-service';
import { PullRequestsService } from '../../src/main/services/pull-requests-service';

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

function snapshot(overrides: Partial<PullRequestsSnapshot> = {}): PullRequestsSnapshot {
  return {
    schemaVersion: 1,
    contextKey: 'demo|p1',
    organization: 'demo',
    projectId: 'p1',
    projectName: 'Projeto',
    teamId: null,
    teamName: null,
    fetchedAt: '2026-11-02T10:00:00.000Z',
    ttlSeconds: 300,
    items: [row],
    truncated: false,
    ...overrides,
  };
}

function cache(value: PullRequestsSnapshot | null, fresh = true) {
  return {
    read: vi.fn(async () => value),
    write: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
    isFresh: vi.fn(() => fresh),
  } as unknown as PullRequestsCacheService;
}

function client(overrides: Record<string, unknown> = {}) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
    listPullRequests: vi.fn(async () => ({ items: [row], truncated: false })),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

describe('PullRequestsService', () => {
  it('usa cache fresco', async () => {
    const fake = client();
    const service = new PullRequestsService(fake, cache(snapshot()));
    const view = await service.load(input);

    expect(view.items).toHaveLength(1);
    expect(fake.listPullRequests).not.toHaveBeenCalled();
  });

  it('força atualização e grava o snapshot', async () => {
    const fake = client();
    const cacheService = cache(snapshot());
    const service = new PullRequestsService(fake, cacheService);
    await service.load({ ...input, force: true });
    expect(cacheService.write).toHaveBeenCalledOnce();
  });

  it('devolve cache stale em falha de rede', async () => {
    const failing = new PullRequestsService(
      client({
        listPullRequests: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
        }),
      }),
      cache(snapshot()),
    );
    const view = await failing.load({ ...input, force: true });
    expect(view.stale).toBe(true);
  });
});
