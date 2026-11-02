import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PipelineTableRow } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import { PipelinesCacheService } from '../../src/main/services/pipelines-cache-service';
import { PipelinesService } from '../../src/main/services/pipelines-service';

const keyProvider = {
  getKey: async () => Buffer.alloc(32, 9),
  clear: async () => undefined,
};

const row: PipelineTableRow = {
  id: 1,
  name: 'Nightly',
  description: 'Nightly regression',
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

function client(overrides: Record<string, unknown> = {}) {
  return {
    getIdentity: vi.fn(async () => ({ id: 'user', displayName: 'Ericles' })),
    listPipelines: vi.fn(async () => ({ items: [row], truncated: false })),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

describe('Pipelines flow', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function cache() {
    const dir = await mkdtemp(join(tmpdir(), 'awa-pipelines-flow-'));
    dirs.push(dir);
    return new PipelinesCacheService(dir, keyProvider);
  }

  it('grava e reutiliza o snapshot', async () => {
    const pipelinesCache = await cache();
    const fake = client();
    const service = new PipelinesService(fake, pipelinesCache);
    await service.load(input);
    await service.load(input);
    expect(fake.listPipelines).toHaveBeenCalledOnce();
    expect((await pipelinesCache.read())?.items).toHaveLength(1);
  });

  it('usa cache stale em falha', async () => {
    const pipelinesCache = await cache();
    await new PipelinesService(client(), pipelinesCache).load(input);
    const failing = new PipelinesService(
      client({
        listPipelines: vi.fn(async () => {
          throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
        }),
      }),
      pipelinesCache,
    );
    const view = await failing.load({ ...input, force: true });
    expect(view.stale).toBe(true);
  });
});
