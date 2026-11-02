import { describe, expect, it } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('AzureDevOpsClient — lista de PRs', () => {
  it('mapeia status, ordena por criação e usa ID com projeto', async () => {
    const calls: string[] = [];
    const client = new AzureDevOpsClient(
      async (input) => {
        calls.push(String(input));
        return json({
          value: [
            {
              pullRequestId: 1,
              title: 'Antigo',
              status: 'completed',
              creationDate: '2026-11-01T10:00:00.000Z',
              repository: { name: 'repo', project: { name: 'Projeto' } },
              _links: { web: { href: 'https://dev.azure.com/demo/Projeto/_git/repo/pullrequest/1' } },
            },
            {
              pullRequestId: 2,
              title: 'Novo',
              status: 'active',
              creationDate: '2026-11-02T10:00:00.000Z',
              repository: { name: 'repo', project: { name: 'Projeto' } },
              _links: { web: { href: 'https://dev.azure.com/demo/Projeto/_git/repo/pullrequest/2' } },
            },
            {
              pullRequestId: 3,
              title: 'Abandonado',
              status: 'abandoned',
              creationDate: '2026-10-31T10:00:00.000Z',
              repository: { name: 'repo', project: { name: 'Projeto' } },
              _links: { web: { href: 'https://dev.azure.com/demo/Projeto/_git/repo/pullrequest/3' } },
            },
          ],
        });
      },
      1000,
      0,
    );

    const result = await client.listPullRequests('demo', 'pat', 'p1');

    expect(calls[0]).toContain('/p1/_apis/git/pullrequests');
    expect(calls[0]).toContain('searchCriteria.status=all');
    expect(calls[0]).toContain('%24top=1000');
    expect(result.truncated).toBe(false);
    expect(result.items.map((item) => item.id)).toEqual([2, 1, 3]);
    expect(result.items[0]).toMatchObject({
      title: 'Novo',
      status: 'active',
      project: 'Projeto',
    });
  });

  it('limita a 1.000 e sinaliza truncamento', async () => {
    const client = new AzureDevOpsClient(
      async () =>
        json({
          value: Array.from({ length: 1_001 }, (_, index) => ({
            pullRequestId: index + 1,
            title: `PR ${index + 1}`,
            status: 'active',
            creationDate: '2026-11-02T10:00:00.000Z',
            repository: { name: 'repo', project: { name: 'Projeto' } },
            _links: { web: { href: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/1' } },
          })),
        }),
      1000,
      0,
    );

    const result = await client.listPullRequests('demo', 'pat', 'p1');

    expect(result.items).toHaveLength(1_000);
    expect(result.truncated).toBe(true);
  });
});
