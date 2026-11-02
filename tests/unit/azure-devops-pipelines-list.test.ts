import { describe, expect, it } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('AzureDevOpsClient — lista de pipelines', () => {
  it('associa definição, calcula duração e mapeia status', async () => {
    const calls: string[] = [];
    const client = new AzureDevOpsClient(
      async (input) => {
        const url = String(input);
        calls.push(url);
        if (url.includes('/build/definitions')) {
          return json({ value: [{ id: 10, description: 'Nightly regression' }] });
        }
        return json({
          value: [
            {
              id: 99,
              buildNumber: '20261102.1',
              status: 'completed',
              result: 'succeeded',
              startTime: '2026-11-02T10:00:00.000Z',
              finishTime: '2026-11-02T10:00:51.000Z',
              definition: { id: 10, name: 'Nightly' },
              project: { name: 'Projeto' },
              _links: { web: { href: 'https://dev.azure.com/demo/p/_build/results?buildId=99' } },
            },
            {
              id: 100,
              status: 'inProgress',
              result: null,
              startTime: '2026-11-02T11:00:00.000Z',
              definition: { id: 10, name: 'Nightly' },
              project: { name: 'Projeto' },
              _links: { web: { href: 'https://dev.azure.com/demo/p/_build/results?buildId=100' } },
            },
          ],
        });
      },
      1000,
      0,
    );

    const result = await client.listPipelines('demo', 'pat', 'p1');

    expect(calls[0]).toContain('/p1/_apis/build/builds');
    expect(calls[0]).toContain('queryOrder=finishTimeDescending');
    expect(calls[0]).toContain('%24top=500');
    expect(calls[1]).toContain('/p1/_apis/build/definitions');
    expect(result.truncated).toBe(false);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      id: 100,
      result: 'unknown',
      status: 'inProgress',
      durationSeconds: null,
    });
    expect(result.items[1]).toMatchObject({
      id: 99,
      name: 'Nightly',
      description: 'Nightly regression',
      result: 'succeeded',
      status: 'completed',
      durationSeconds: 51,
    });
  });

  it('limita a 500 e sinaliza truncamento', async () => {
    const client = new AzureDevOpsClient(
      async (input) => {
        const url = String(input);
        if (url.includes('/build/definitions')) return json({ value: [] });
        return json({
          value: Array.from({ length: 500 }, (_, index) => ({
            id: index + 1,
            buildNumber: `b${index}`,
            status: 'completed',
            result: 'succeeded',
            startTime: '2026-11-02T10:00:00.000Z',
            finishTime: '2026-11-02T10:01:00.000Z',
            definition: { id: 1, name: 'Pipeline' },
            project: { name: 'Projeto' },
            _links: { web: { href: 'https://dev.azure.com/demo/p/_build/results?buildId=1' } },
          })),
        });
      },
      1000,
      0,
    );

    const result = await client.listPipelines('demo', 'pat', 'p1');
    expect(result.items).toHaveLength(500);
    expect(result.truncated).toBe(true);
  });
});
