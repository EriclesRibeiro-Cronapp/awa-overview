import { describe, expect, it, vi } from 'vitest';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('Azure DevOps contract', () => {
  it('usa a versão 7.1 e o endpoint de projetos', async () => {
    let captured = '';
    const client = new AzureDevOpsClient(async (url) => {
      captured = String(url);
      return response({ value: [] });
    }, 1000, 0);

    await client.listProjects('demo-org', 'pat');

    expect(captured).toContain('https://dev.azure.com/demo-org/_apis/projects');
    expect(captured).toContain('api-version=7.1');
  });

  it('não expõe métodos de escrita', () => {
    const client = new AzureDevOpsClient(vi.fn(), 1000, 0);
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(client));

    expect(methods).not.toContain('createProject');
    expect(methods).not.toContain('updateProject');
    expect(methods).not.toContain('deleteProject');
    expect(methods).toContain('listProjects');
    expect(methods).toContain('listTeams');
  });
});
