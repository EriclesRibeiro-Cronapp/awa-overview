import { mkdtemp, rm } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';
import { CacheService, type CacheKeyProvider } from '../../src/main/services/cache-service';
import { ProjectsService } from '../../src/main/services/projects-service';

function keyProvider(): CacheKeyProvider {
  const key = randomBytes(32);
  return { getKey: async () => key, clear: async () => undefined };
}

function json(body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('ProjectsService + AzureDevOpsClient integration', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function makeDir(): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), 'awa-projects-integration-'));
    dirs.push(dir);
    return dir;
  }

  it('pagina projetos, grava cache e lista times do projeto', async () => {
    const dir = await makeDir();
    let projectCalls = 0;

    const client = new AzureDevOpsClient(async (url) => {
      const value = String(url);
      if (value.includes('/projects/p1/teams')) {
        return json({ value: [{ id: 't1', name: 'Time A' }] });
      }
      if (value.includes('/projects')) {
        projectCalls += 1;
        if (projectCalls === 1) {
          return json(
            { value: [{ id: 'p1', name: 'Projeto Um', state: 'wellFormed' }] },
            { 'x-ms-continuationtoken': 'next' },
          );
        }
        return json({ value: [{ id: 'p2', name: 'Projeto Dois', state: 'wellFormed' }] });
      }
      return json({ value: [] });
    }, 1000, 0);

    const cache = new CacheService(dir, keyProvider());
    const service = new ProjectsService(client, cache);

    const projects = await service.listProjects('demo', 'pat');
    expect(projects.items.map((project) => project.id)).toEqual(['p1', 'p2']);
    expect(projects.stale).toBe(false);

    const snapshot = await cache.read();
    expect(snapshot?.projects).toHaveLength(2);

    const teams = await service.listTeams('demo', 'pat', 'p1');
    expect(teams.items).toEqual([{ id: 't1', name: 'Time A', projectId: 'p1' }]);

    const before = projectCalls;
    await service.listProjects('demo', 'pat');
    expect(projectCalls).toBe(before);
  });

  it('usa cache stale quando a API fica indisponível', async () => {
    const dir = await makeDir();
    let offline = false;

    const client = new AzureDevOpsClient(async (url) => {
      if (offline) throw new Error('offline');
      if (String(url).includes('/projects')) {
        return json({ value: [{ id: 'p1', name: 'Projeto', state: 'wellFormed' }] });
      }
      return json({ value: [] });
    }, 1000, 0);

    const cache = new CacheService(dir, keyProvider());
    const service = new ProjectsService(client, cache, 0);
    await service.listProjects('demo', 'pat');

    offline = true;
    const result = await service.listProjects('demo', 'pat');

    expect(result.stale).toBe(true);
    expect(result.items[0].id).toBe('p1');
  });
});
