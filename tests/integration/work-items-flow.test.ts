import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkItemTableRow } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import { WorkItemsCacheService } from '../../src/main/services/work-items-cache-service';
import { WorkItemsService } from '../../src/main/services/work-items-service';

const keyProvider = {
  getKey: async () => Buffer.alloc(32, 5),
  clear: async () => undefined,
};

const items: WorkItemTableRow[] = [
  {
    id: 1,
    type: 'PBI',
    title: 'Item',
    state: 'Active',
    sprint: 'Sprint 1',
    assignedTo: 'Ericles',
    changedAt: '2026-11-02T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_workitems/edit/1',
  },
];

const input = {
  organization: 'demo',
  pat: 'pat',
  projectId: 'p1',
  projectName: 'Projeto',
  teamId: 't1',
  teamName: 'Time',
  force: false,
};

function client(overrides: Record<string, unknown> = {}) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
    listWorkItems: vi.fn(async () => ({ items, truncated: false })),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

describe('Work items flow', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function cache() {
    const dir = await mkdtemp(join(tmpdir(), 'awa-work-items-flow-'));
    dirs.push(dir);
    return new WorkItemsCacheService(dir, keyProvider);
  }

  it('grava e reutiliza o snapshot', async () => {
    const workItemsCache = await cache();
    const fake = client();
    const service = new WorkItemsService(fake, workItemsCache);

    await service.load(input);
    await service.load(input);

    expect(fake.listWorkItems).toHaveBeenCalledOnce();
    expect((await workItemsCache.read())?.items).toHaveLength(1);
  });

  it('usa cache stale quando a consulta falha', async () => {
    const workItemsCache = await cache();
    const service = new WorkItemsService(client(), workItemsCache);
    await service.load(input);

    const failing = new WorkItemsService(
      client({
        listWorkItems: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
        }),
      }),
      workItemsCache,
    );
    const view = await failing.load({ ...input, force: true });

    expect(view.stale).toBe(true);
    expect(view.items).toHaveLength(1);
  });

  it('ignora cache de outro contexto', async () => {
    const workItemsCache = await cache();
    const service = new WorkItemsService(client(), workItemsCache);
    await service.load(input);

    const other = new WorkItemsService(client(), workItemsCache);
    await other.load({ ...input, projectId: 'p2', projectName: 'Outro' });

    expect((await workItemsCache.read())?.projectId).toBe('p2');
  });
});
