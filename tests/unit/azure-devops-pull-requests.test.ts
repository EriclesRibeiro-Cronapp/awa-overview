import { describe, expect, it } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('AzureDevOpsClient — pull requests e pipelines', () => {
  it('escolhe o PR ativo mais recente que precisa do voto do usuário', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new AzureDevOpsClient(
      async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        if (url.includes('/connectionData')) {
          return json({
            authenticatedUser: { id: 'user-1', providerDisplayName: 'Ericles' },
          });
        }
        return json({
          value: [
            {
              pullRequestId: 1,
              title: 'Já aprovado',
              status: 'active',
              creationDate: '2026-11-01T10:00:00.000Z',
              repository: { name: 'repo', project: { name: 'Projeto Teste' } },
              reviewers: [{ id: 'user-1', vote: 10 }],
              _links: { web: { href: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/1' } },
            },
            {
              pullRequestId: 2,
              title: 'Aguardando revisão',
              status: 'active',
              creationDate: '2026-11-02T10:00:00.000Z',
              repository: { name: 'repo', project: { name: 'Projeto Teste' } },
              reviewers: [{ id: 'user-1', vote: 0 }],
              _links: { web: { href: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/2' } },
            },
          ],
        });
      },
      1000,
      0,
    );

    const pr = await client.getPullRequestNeedingAttention('demo', 'pat', 'p1');

    expect(calls[1]?.url).toContain('/p1/_apis/git/pullrequests');
    expect(calls[1]?.url).toContain('searchCriteria.reviewerId=user-1');
    expect(pr).toMatchObject({
      id: 2,
      title: 'Aguardando revisão',
      status: 'Aguardando aprovação',
      project: 'Projeto Teste',
    });
  });

  it('mapeia a execução de pipeline mais recente', async () => {
    const calls: string[] = [];
    const client = new AzureDevOpsClient(
      async (input) => {
        calls.push(String(input));
        return json({
          value: [
            {
              id: 99,
              status: 'completed',
              result: 'failed',
              startTime: '2026-11-02T10:00:00.000Z',
              definition: { name: 'Nightly' },
              project: { name: 'Projeto Teste' },
              _links: { web: { href: 'https://dev.azure.com/demo/p/_build/results?buildId=99' } },
            },
          ],
        });
      },
      1000,
      0,
    );

    const run = await client.getLatestPipelineRun('demo', 'pat', 'p1');

    expect(calls[0]).toContain('/p1/_apis/build/builds');
    expect(calls[0]).toContain('queryOrder=finishTimeDescending');
    expect(run).toMatchObject({
      id: 99,
      name: 'Nightly',
      result: 'failed',
      status: 'completed',
      project: 'Projeto Teste',
      startedAt: '2026-11-02T10:00:00.000Z',
    });
  });
});
