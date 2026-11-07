import { describe, expect, it } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function workItemFields(index: number, priority: number | null = null) {
  return {
    'System.WorkItemType': 'Bug',
    'System.Title': `Item ${index}`,
    'System.State': 'Active',
    'System.TeamProject': 'Projeto Teste',
    'System.AssignedTo': { displayName: 'Ericles' },
    'System.ChangedDate': `2026-11-${String(20 - index).padStart(2, '0')}T10:00:00.000Z`,
    ...(priority === null ? {} : { 'Microsoft.VSTS.Common.Priority': priority }),
  };
}

describe('AzureDevOpsClient — Overview com 10 itens', () => {
  it('seleciona os 10 work items mais recentes e ordena por prioridade', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const priorities = new Map<number, number | null>([
      [1, 5],
      [2, 3],
      [3, 1],
      [4, 2],
      [5, 4],
      [6, null],
      [7, 6],
      [8, 7],
      [9, 8],
      [10, 9],
    ]);

    const client = new AzureDevOpsClient(
      async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        if (url.includes('/wit/wiql')) {
          return json({
            workItems: Array.from({ length: 12 }, (_, index) => ({ id: index + 1 })),
          });
        }
        if (url.includes('/wit/workitems')) {
          return json({
            value: Array.from({ length: 10 }, (_, index) => {
              const id = index + 1;
              return { id, fields: workItemFields(id, priorities.get(id) ?? null) };
            }),
          });
        }
        return json({});
      },
      1000,
      0,
    );

    const items = await client.listAssignedWorkItems('demo', 'pat', 'p1', null);

    expect(items).toHaveLength(10);
    expect(items.map((item) => item.id)).toEqual([3, 4, 2, 5, 1, 7, 8, 9, 10, 6]);
    expect(items.at(-1)).toMatchObject({ id: 6, priority: null });
    expect(calls[1]?.url).toContain('ids=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10');
    expect(calls[1]?.url).not.toContain('ids=11');
    expect(calls[1]?.url).toContain('Microsoft.VSTS.Common.Priority');
  });

  it('busca até 10 PRs em que o usuário é autor ou revisor, por criação desc', async () => {
    const calls: string[] = [];
    const related = Array.from({ length: 12 }, (_, index) => {
      const id = index + 1;
      const isAuthor = id % 2 === 0;
      return {
        pullRequestId: id,
        title: `PR ${id}`,
        status: 'active',
        isDraft: id === 12,
        creationDate: `2026-11-${String(id).padStart(2, '0')}T10:00:00.000Z`,
        createdBy: { id: isAuthor ? 'user-1' : 'outro' },
        reviewers: isAuthor
          ? []
          : [{ id: 'user-1', vote: id === 11 ? 0 : 10 }],
        repository: { name: 'repo', project: { name: 'Projeto Teste' } },
        _links: { web: { href: `https://dev.azure.com/demo/p/_git/repo/pullrequest/${id}` } },
      };
    });

    const client = new AzureDevOpsClient(
      async (input) => {
        const url = String(input);
        calls.push(url);
        if (url.includes('/connectionData')) {
          return json({ authenticatedUser: { id: 'user-1', providerDisplayName: 'Ericles' } });
        }
        return json({
          value: [
            ...related,
            {
              pullRequestId: 13,
              title: 'Não relacionado',
              status: 'active',
              creationDate: '2026-11-30T10:00:00.000Z',
              createdBy: { id: 'outro' },
              reviewers: [],
            },
            {
              pullRequestId: 14,
              title: 'Concluído pelo usuário',
              status: 'completed',
              creationDate: '2026-11-30T10:00:00.000Z',
              createdBy: { id: 'user-1' },
              reviewers: [],
            },
          ],
        });
      },
      1000,
      0,
    );

    const pullRequests = await client.listRelatedPullRequests('demo', 'pat', 'p1');

    expect(pullRequests).toHaveLength(10);
    expect(pullRequests.map((pr) => pr.id)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
    expect(pullRequests[0]?.status).toBe('Rascunho');
    expect(pullRequests[1]?.status).toBe('Aguardando aprovação');
    expect(pullRequests[2]?.status).toBe('Ativo');
    expect(calls[1]).toContain('searchCriteria.status=active');
    expect(calls[1]).toContain('%24top=100');
  });

  it('busca até 10 pipelines e ordena por startedAt descendente', async () => {
    const calls: string[] = [];
    const client = new AzureDevOpsClient(
      async (input) => {
        calls.push(String(input));
        return json({
          value: Array.from({ length: 12 }, (_, index) => {
            const id = index + 1;
            return {
              id,
              status: 'completed',
              result: 'succeeded',
              startTime: `2026-11-${String(id).padStart(2, '0')}T10:00:00.000Z`,
              definition: { name: `Pipeline ${id}` },
              project: { name: 'Projeto Teste' },
              _links: { web: { href: `https://dev.azure.com/demo/p/_build/results?buildId=${id}` } },
            };
          }),
        });
      },
      1000,
      0,
    );

    const pipelines = await client.listRecentPipelineRuns('demo', 'pat', 'p1');

    expect(pipelines).toHaveLength(10);
    expect(pipelines.map((pipeline) => pipeline.id)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
    expect(calls[0]).toContain('%24top=10');
    expect(calls[0]).toContain('queryOrder=startTimeDescending');
  });
});
