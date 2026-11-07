import { describe, expect, it, vi } from 'vitest';
import type {
  PipelineRunSummary,
  PullRequestSummary,
  WorkItemSummary,
} from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import type { OverviewCacheService, OverviewSnapshot } from '../../src/main/services/overview-cache-service';
import { OverviewService } from '../../src/main/services/overview-service';

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
    fetchedAt: '2026-11-02T10:00:00.000Z',
    ttlSeconds: 300,
    workItems: [workItem],
    pullRequests: [pullRequest],
    pipelines: [pipeline],
    ...overrides,
  };
}

function fakeCache(value: OverviewSnapshot | null, fresh = true) {
  return {
    read: vi.fn(async () => value),
    write: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
    isFresh: vi.fn(() => fresh),
  } as unknown as OverviewCacheService;
}

function fakeClient(overrides: Partial<Record<keyof AzureDevOpsClient, unknown>> = {}) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user-1', displayName: 'Ericles' })),
    listAssignedWorkItems: vi.fn(async () => [workItem]),
    listRelatedPullRequests: vi.fn(async () => [pullRequest]),
    listRecentPipelineRuns: vi.fn(async () => [pipeline]),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

describe('OverviewService', () => {
  it('usa cache fresco sem chamar o Azure DevOps', async () => {
    const cache = fakeCache(snapshot());
    const client = fakeClient();
    const service = new OverviewService(client, cache);

    const view = await service.load(input);

    expect(view.workItems).toMatchObject({ ok: true, stale: false, data: [workItem] });
    expect(client.listAssignedWorkItems).not.toHaveBeenCalled();
    expect(cache.write).not.toHaveBeenCalled();
  });

  it('força atualização e grava o novo snapshot', async () => {
    const cache = fakeCache(snapshot());
    const client = fakeClient();
    const service = new OverviewService(client, cache);

    const view = await service.load({ ...input, force: true });

    expect(client.listAssignedWorkItems).toHaveBeenCalledOnce();
    expect(cache.write).toHaveBeenCalledOnce();
    expect(view.stale).toBe(false);
  });

  it('devolve cache stale quando um card falha', async () => {
    const cache = fakeCache(snapshot());
    const client = fakeClient({
      listAssignedWorkItems: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
      }),
    });
    const service = new OverviewService(client, cache);

    const view = await service.load({ ...input, force: true });

    expect(view.workItems).toMatchObject({ ok: true, stale: true, data: [workItem] });
    expect(view.stale).toBe(true);
    expect(cache.write).not.toHaveBeenCalled();
  });

  it('retorna erro por card quando não há cache', async () => {
    const cache = fakeCache(null);
    const client = fakeClient({
      listRecentPipelineRuns: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_FORBIDDEN);
      }),
    });
    const service = new OverviewService(client, cache);

    const view = await service.load(input);

    expect(view.pipelines).toMatchObject({
      ok: false,
      error: { code: ErrorCode.CONFIG_FORBIDDEN },
    });
    expect(view.workItems).toMatchObject({ ok: true, stale: false });
  });

  it('mapeia 401 em card com identidade válida para falta de escopo', async () => {
    const cache = fakeCache(null);
    const client = fakeClient({
      listAssignedWorkItems: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
      }),
    });
    const service = new OverviewService(client, cache);

    const view = await service.load(input);

    expect(view.workItems).toMatchObject({
      ok: false,
      error: { code: ErrorCode.CONFIG_FORBIDDEN },
    });
  });

  it('retorna o erro de identidade em todos os cards quando o PAT é inválido', async () => {
    const cache = fakeCache(null);
    const client = fakeClient({
      getIdentity: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
      }),
    });
    const service = new OverviewService(client, cache);

    const view = await service.load(input);

    expect(view.workItems).toMatchObject({
      ok: false,
      error: { code: ErrorCode.CONFIG_PAT_INVALID },
    });
    expect(client.listAssignedWorkItems).not.toHaveBeenCalled();
  });

  it('ignora cache de outro contexto', async () => {
    const cache = fakeCache(snapshot({ contextKey: 'demo|p2|' }));
    const client = fakeClient();
    const service = new OverviewService(client, cache);

    await service.load(input);

    expect(client.listAssignedWorkItems).toHaveBeenCalledOnce();
  });
});
