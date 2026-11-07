import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  PipelineRunSummary,
  PullRequestSummary,
  WorkItemSummary,
} from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import {
  OverviewCacheService,
  type OverviewSnapshot,
} from '../../src/main/services/overview-cache-service';
import { OverviewService } from '../../src/main/services/overview-service';

const keyProvider = {
  getKey: async () => Buffer.alloc(32, 3),
  clear: async () => undefined,
};

const workItem: WorkItemSummary = {
  id: 1,
  type: 'Bug',
  title: 'Item',
  state: 'Active',
  project: 'Projeto',
  assignedTo: 'Ericles',
  changedAt: '2026-11-02T10:00:00.000Z',
  priority: 2,
  url: 'https://dev.azure.com/demo/Projeto/_workitems/edit/1',
};

const pullRequest: PullRequestSummary = {
  id: 2,
  title: 'PR',
  status: 'Aguardando aprovação',
  project: 'Projeto',
  createdAt: '2026-11-02T10:00:00.000Z',
  url: 'https://dev.azure.com/demo/Projeto/_git/repo/pullrequest/2',
};

const pipeline: PipelineRunSummary = {
  id: 3,
  name: 'Pipeline',
  result: 'succeeded',
  status: 'completed',
  project: 'Projeto',
  startedAt: '2026-11-02T10:00:00.000Z',
  url: 'https://dev.azure.com/demo/Projeto/_build/results?buildId=3',
};

const input = {
  organization: 'demo',
  pat: 'pat',
  projectId: 'p1',
  projectName: 'Projeto',
  teamId: 't1',
  teamName: 'Time',
  force: false,
};

function snapshot(overrides: Partial<OverviewSnapshot> = {}): OverviewSnapshot {
  return {
    schemaVersion: 2,
    contextKey: 'demo|p1|t1',
    organization: 'demo',
    projectId: 'p1',
    projectName: 'Projeto',
    teamId: 't1',
    teamName: 'Time',
    fetchedAt: new Date().toISOString(),
    ttlSeconds: 300,
    workItems: [workItem],
    pullRequests: [pullRequest],
    pipelines: [pipeline],
    ...overrides,
  };
}

function client(overrides: Record<string, unknown> = {}) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
    listAssignedWorkItems: vi.fn(async () => [workItem]),
    listRelatedPullRequests: vi.fn(async () => [pullRequest]),
    listRecentPipelineRuns: vi.fn(async () => [pipeline]),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

describe('Overview flow', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function cache() {
    const dir = await mkdtemp(join(tmpdir(), 'awa-overview-flow-'));
    dirs.push(dir);
    return new OverviewCacheService(dir, keyProvider);
  }

  it('grava o snapshot e reutiliza no próximo carregamento', async () => {
    const overviewCache = await cache();
    const fake = client();
    const service = new OverviewService(fake, overviewCache);

    await service.load(input);
    expect((await overviewCache.read())?.workItems).toHaveLength(1);

    await service.load(input);
    expect(fake.listAssignedWorkItems).toHaveBeenCalledOnce();
  });

  it('usa cache stale quando a rede falha', async () => {
    const overviewCache = await cache();
    await overviewCache.write(
      snapshot({ fetchedAt: '2026-11-02T10:00:00.000Z' }),
    );
    const fake = client({
      listAssignedWorkItems: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
      }),
      listRelatedPullRequests: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
      }),
      listRecentPipelineRuns: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
      }),
    });
    const service = new OverviewService(fake, overviewCache);

    const view = await service.load({ ...input, force: true });

    expect(view.stale).toBe(true);
    expect(view.workItems).toMatchObject({ ok: true, stale: true, data: [workItem] });
  });

  it('não reutiliza cache de outro contexto', async () => {
    const overviewCache = await cache();
    await overviewCache.write(snapshot());
    const fake = client();
    const service = new OverviewService(fake, overviewCache);

    await service.load({ ...input, projectId: 'p2', projectName: 'Outro' });

    expect(fake.listAssignedWorkItems).toHaveBeenCalledOnce();
    expect((await overviewCache.read())?.projectId).toBe('p2');
  });
});
