import { describe, expect, it, vi } from 'vitest';
import type { PipelineTableRow } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import type {
  PipelinesCacheService,
  PipelinesSnapshot,
} from '../../src/main/services/pipelines-cache-service';
import { PipelinesService } from '../../src/main/services/pipelines-service';

const row: PipelineTableRow = {
  id: 1,
  name: 'Pipeline',
  description: 'Nightly',
  result: 'succeeded',
  status: 'completed',
  project: 'Projeto',
  startedAt: '2026-11-02T10:00:00.000Z',
  finishedAt: '2026-11-02T10:00:51.000Z',
  durationSeconds: 51,
  url: 'https://dev.azure.com/demo/p/_build/results?buildId=1',
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

function snapshot(overrides: Partial<PipelinesSnapshot> = {}): PipelinesSnapshot {
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

function cache(value: PipelinesSnapshot | null, fresh = true) {
  return {
    read: vi.fn(async () => value),
    write: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
    isFresh: vi.fn(() => fresh),
  } as unknown as PipelinesCacheService;
}

function client(overrides: Record<string, unknown> = {}) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
    listPipelines: vi.fn(async () => ({ items: [row], truncated: false })),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

describe('PipelinesService', () => {
  it('usa cache fresco', async () => {
    const fake = client();
    const service = new PipelinesService(fake, cache(snapshot()));
    const view = await service.load(input);
    expect(view.items).toHaveLength(1);
    expect(fake.listPipelines).not.toHaveBeenCalled();
  });

  it('força atualização e grava snapshot', async () => {
    const cacheService = cache(snapshot());
    const service = new PipelinesService(client(), cacheService);
    await service.load({ ...input, force: true });
    expect(cacheService.write).toHaveBeenCalledOnce();
  });

  it('devolve cache stale em falha', async () => {
    const service = new PipelinesService(
      client({
        listPipelines: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
        }),
      }),
      cache(snapshot()),
    );
    const view = await service.load({ ...input, force: true });
    expect(view.stale).toBe(true);
  });
});
