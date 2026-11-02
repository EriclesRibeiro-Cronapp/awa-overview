import { describe, expect, it, vi } from 'vitest';
import type { WorkItemTableRow } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import type { WorkItemsCacheService, WorkItemsSnapshot } from '../../src/main/services/work-items-cache-service';
import { WorkItemsService } from '../../src/main/services/work-items-service';

const row = (id: number, state: string): WorkItemTableRow => ({
  id,
  type: 'PBI',
  title: `Item ${id}`,
  state,
  sprint: 'Sprint 1',
  assignedTo: 'Ericles',
  changedAt: '2026-11-02T10:00:00.000Z',
  url: `https://dev.azure.com/demo/Projeto/_workitems/edit/${id}`,
});

const input = {
  organization: 'demo',
  pat: 'pat',
  projectId: 'p1',
  projectName: 'Projeto',
  teamId: 't1',
  teamName: 'Time',
  force: false,
};

function snapshot(overrides: Partial<WorkItemsSnapshot> = {}): WorkItemsSnapshot {
  return {
    schemaVersion: 1,
    contextKey: 'demo|p1|t1',
    organization: 'demo',
    projectId: 'p1',
    projectName: 'Projeto',
    teamId: 't1',
    teamName: 'Time',
    fetchedAt: '2026-11-02T10:00:00.000Z',
    ttlSeconds: 300,
    items: [row(1, 'Active')],
    truncated: false,
    ...overrides,
  };
}

function cache(value: WorkItemsSnapshot | null, fresh = true) {
  return {
    read: vi.fn(async () => value),
    write: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
    isFresh: vi.fn(() => fresh),
  } as unknown as WorkItemsCacheService;
}

function client(items = [row(1, 'New'), row(2, 'Active'), row(3, 'Done'), row(4, 'Removed')]) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
    listWorkItems: vi.fn(async () => ({ items, truncated: false })),
  } as unknown as AzureDevOpsClient;
}

describe('WorkItemsService', () => {
  it('usa cache fresco e calcula o resumo', async () => {
    const fake = client();
    const service = new WorkItemsService(fake, cache(snapshot()));
    const view = await service.load(input);

    expect(view.summary).toEqual({ total: 1, backlog: 0, inProgress: 1, done: 0 });
    expect(fake.listWorkItems).not.toHaveBeenCalled();
  });

  it('força atualização e grava o snapshot', async () => {
    const fake = client();
    const overviewCache = cache(snapshot());
    const service = new WorkItemsService(fake, overviewCache);
    const view = await service.load({ ...input, force: true });

    expect(view.summary).toEqual({ total: 4, backlog: 1, inProgress: 1, done: 1 });
    expect(overviewCache.write).toHaveBeenCalledOnce();
  });

  it('mapeia 401 em work items com identidade válida para falta de escopo', async () => {
    const service = new WorkItemsService(
      {
        getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
        listWorkItems: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
        }),
      } as unknown as AzureDevOpsClient,
      cache(null, false),
    );

    await expect(service.load(input)).rejects.toMatchObject({
      code: ErrorCode.CONFIG_FORBIDDEN,
    });
  });

  it('devolve cache stale em falha de rede', async () => {
    const service = new WorkItemsService(
      {
        getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
        listWorkItems: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
        }),
      } as unknown as AzureDevOpsClient,
      cache(snapshot()),
    );

    const view = await service.load({ ...input, force: true });

    expect(view.stale).toBe(true);
    expect(view.items).toHaveLength(1);
  });
});
