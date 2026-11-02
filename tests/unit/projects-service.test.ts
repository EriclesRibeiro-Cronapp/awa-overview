import { describe, expect, it, vi } from 'vitest';
import type { CacheSnapshot, Project, Team } from '@shared/contracts';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import type { CacheService } from '../../src/main/services/cache-service';
import { ProjectsService } from '../../src/main/services/projects-service';

const project: Project = { id: 'p1', name: 'Projeto', state: 'wellFormed' };
const team: Team = { id: 't1', name: 'Time', projectId: 'p1' };

function fakeCache(initial: CacheSnapshot | null = null, fresh = true) {
  let snapshot = initial;
  return {
    read: vi.fn(async () => snapshot),
    write: vi.fn(async (value: CacheSnapshot) => {
      snapshot = value;
    }),
    isFresh: vi.fn(() => fresh),
    clear: vi.fn(async () => {
      snapshot = null;
    }),
  } as unknown as CacheService & { read: ReturnType<typeof vi.fn> };
}

function fakeClient(overrides: Partial<AzureDevOpsClient> = {}) {
  return {
    listProjects: vi.fn(async () => [project]),
    listTeams: vi.fn(async () => [team]),
    ...overrides,
  } as unknown as AzureDevOpsClient;
}

const snapshot: CacheSnapshot = {
  schemaVersion: 1,
  organization: 'demo',
  projects: [project],
  teamsByProject: { p1: [team] },
  fetchedAt: new Date().toISOString(),
  ttlSeconds: 900,
};

describe('ProjectsService', () => {
  it('busca e grava no cache quando não há snapshot', async () => {
    const cache = fakeCache(null);
    const client = fakeClient();
    const service = new ProjectsService(client, cache);

    const result = await service.listProjects('demo', 'pat');

    expect(result.items).toEqual([project]);
    expect(result.stale).toBe(false);
    expect(client.listProjects).toHaveBeenCalledWith('demo', 'pat');
    expect(cache.write).toHaveBeenCalledOnce();
  });

  it('usa cache fresco sem chamar a API', async () => {
    const cache = fakeCache(snapshot, true);
    const client = fakeClient();
    const service = new ProjectsService(client, cache);

    const result = await service.listProjects('demo', 'pat');

    expect(result.items).toEqual([project]);
    expect(client.listProjects).not.toHaveBeenCalled();
  });

  it('retorna cache stale quando a API está offline', async () => {
    const cache = fakeCache(snapshot, false);
    const client = fakeClient({
      listProjects: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
      }),
    });
    const service = new ProjectsService(client, cache);

    const result = await service.listProjects('demo', 'pat');

    expect(result.stale).toBe(true);
    expect(result.items).toEqual([project]);
  });

  it('propaga erro de autenticação sem usar cache', async () => {
    const cache = fakeCache(snapshot, false);
    const client = fakeClient({
      listProjects: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
      }),
    });
    const service = new ProjectsService(client, cache);

    await expect(service.listProjects('demo', 'pat')).rejects.toMatchObject({
      code: ErrorCode.CONFIG_PAT_INVALID,
    });
  });

  it('busca times e atualiza o snapshot', async () => {
    const cache = fakeCache(snapshot, false);
    const client = fakeClient();
    const service = new ProjectsService(client, cache);

    const result = await service.listTeams('demo', 'pat', 'p1');

    expect(result.items).toEqual([team]);
    expect(cache.write).toHaveBeenCalledOnce();
  });

  it('usa times em cache fresco', async () => {
    const cache = fakeCache(snapshot, true);
    const client = fakeClient();
    const service = new ProjectsService(client, cache);

    const result = await service.listTeams('demo', 'pat', 'p1');

    expect(result.items).toEqual([team]);
    expect(client.listTeams).not.toHaveBeenCalled();
  });

  it('retorna times stale quando a API está offline', async () => {
    const cache = fakeCache(snapshot, false);
    const client = fakeClient({
      listTeams: vi.fn(async () => {
        throw new AppErrorException(ErrorCode.CONFIG_NETWORK);
      }),
    });
    const service = new ProjectsService(client, cache);

    const result = await service.listTeams('demo', 'pat', 'p1');

    expect(result.stale).toBe(true);
    expect(result.items).toEqual([team]);
  });
});
