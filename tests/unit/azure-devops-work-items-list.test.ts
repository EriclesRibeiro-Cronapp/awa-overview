import { describe, expect, it } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('AzureDevOpsClient — lista de work items', () => {
  it('consulta todos os estados e mapeia sprint/iteração', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new AzureDevOpsClient(
      async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        if (url.includes('teamfieldvalues')) {
          return json({ values: [{ value: 'Projeto\\Time', includeChildren: true }] });
        }
        if (url.includes('/wit/wiql')) {
          return json({ workItems: [{ id: 1 }, { id: 2 }] });
        }
        return json({
          value: [
            {
              id: 1,
              fields: {
                'System.WorkItemType': 'PBI',
                'System.Title': 'Item um',
                'System.State': 'Active',
                'System.TeamProject': 'Projeto',
                'System.IterationPath': 'Projeto\\Sprint 1',
                'System.AssignedTo': { displayName: 'Ericles' },
                'System.ChangedDate': '2026-11-02T10:00:00.000Z',
              },
            },
            {
              id: 2,
              fields: {
                'System.WorkItemType': 'Bug',
                'System.Title': 'Item dois',
                'System.State': 'Closed',
                'System.TeamProject': 'Projeto',
                'System.ChangedDate': '2026-11-02T09:00:00.000Z',
              },
            },
          ],
        });
      },
      1000,
      0,
    );

    const result = await client.listWorkItems('demo', 'pat', 'p1', 't1');

    expect(result.truncated).toBe(false);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      id: 1,
      type: 'PBI',
      title: 'Item um',
      state: 'Active',
      sprint: 'Sprint 1',
      assignedTo: 'Ericles',
    });
    expect(result.items[1]?.sprint).toBeNull();

    const wiql = calls.find((call) => call.url.includes('/wit/wiql'));
    const body = JSON.parse(String(wiql?.init?.body)) as { query: string };
    expect(body.query).not.toContain('AssignedTo');
    expect(body.query).not.toContain("NOT IN ('Closed'");
    expect(body.query).toContain("[System.AreaPath] UNDER 'Projeto\\Time'");
  });

  it('limita a 2.000 itens e sinaliza truncamento', async () => {
    const client = new AzureDevOpsClient(
      async (input) => {
        const url = String(input);
        if (url.includes('/wit/wiql')) {
          return json({ workItems: Array.from({ length: 2_001 }, (_, index) => ({ id: index + 1 })) });
        }
        return json({ value: [] });
      },
      1000,
      0,
    );

    const result = await client.listWorkItems('demo', 'pat', 'p1', null);

    expect(result.truncated).toBe(true);
    expect(result.items).toHaveLength(0);
  });
});
