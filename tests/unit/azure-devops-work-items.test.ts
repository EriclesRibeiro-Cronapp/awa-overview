import { describe, expect, it } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('AzureDevOpsClient — work items', () => {
  it('consulta o time, o WIQL e mapeia os campos', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new AzureDevOpsClient(
      async (input, init) => {
        const url = String(input);
        calls.push({ url, init });
        if (url.includes('teamfieldvalues')) {
          return json({ values: [{ value: 'Projeto\\Time A', includeChildren: true }] });
        }
        if (url.includes('/wit/wiql')) {
          return json({ workItems: [{ id: 101 }, { id: 102 }, { id: 103 }] });
        }
        if (url.includes('/wit/workitems')) {
          return json({
            value: [
              {
                id: 101,
                fields: {
                  'System.WorkItemType': 'Bug',
                  'System.Title': 'Corrigir login',
                  'System.State': 'Active',
                  'System.TeamProject': 'Projeto Teste',
                  'System.AssignedTo': { displayName: 'Ericles Ribeiro' },
                  'System.ChangedDate': '2026-11-02T10:00:00.000Z',
                },
              },
              {
                id: 102,
                fields: {
                  'System.WorkItemType': 'Task',
                  'System.Title': 'Criar teste',
                  'System.State': 'New',
                  'System.TeamProject': 'Projeto Teste',
                  'System.ChangedDate': '2026-11-02T09:00:00.000Z',
                },
              },
            ],
          });
        }
        return json({});
      },
      1000,
      0,
    );

    const items = await client.listAssignedWorkItems('demo', 'pat', 'projeto-id', 'time-id', 3);

    expect(calls[0]?.url).toContain('/projeto-id/time-id/_apis/work/teamsettings/teamfieldvalues');
    expect(calls[0]?.url).toContain('api-version=7.1');

    expect(calls[1]?.url).toContain('/projeto-id/_apis/wit/wiql');
    expect(calls[1]?.url).toContain('api-version=7.1');
    expect(calls[1]?.init?.method).toBe('POST');
    const body = JSON.parse(String(calls[1]?.init?.body)) as { query: string };
    expect(body.query).toContain("[System.AreaPath] UNDER 'Projeto\\Time A'");
    expect(body.query).toContain('ORDER BY [System.ChangedDate] DESC');

    expect(calls[2]?.url).toContain('/_apis/wit/workitems');
    expect(calls[2]?.url).toContain('ids=101%2C102%2C103');
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: 101,
      type: 'Bug',
      title: 'Corrigir login',
      state: 'Active',
      project: 'Projeto Teste',
      assignedTo: 'Ericles Ribeiro',
      url: 'https://dev.azure.com/demo/Projeto%20Teste/_workitems/edit/101',
    });
    expect(items[1]?.assignedTo).toBeNull();
  });

  it('não aplica area path quando não há time', async () => {
    let wiqlBody = '';
    const client = new AzureDevOpsClient(
      async (input, init) => {
        const url = String(input);
        if (url.includes('/wit/wiql')) {
          wiqlBody = String(init?.body);
          return json({ workItems: [] });
        }
        return json({});
      },
      1000,
      0,
    );

    const items = await client.listAssignedWorkItems('demo', 'pat', 'p1', null);

    expect(items).toEqual([]);
    expect(wiqlBody).not.toContain('System.AreaPath');
  });
});
