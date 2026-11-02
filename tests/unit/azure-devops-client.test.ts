import { describe, expect, it } from 'vitest';
import { AppErrorException, ErrorCode } from '@shared/errors';
import { AzureDevOpsClient } from '../../src/main/services/azure-devops-client';

function response(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });
}

describe('AzureDevOpsClient', () => {
  it('valida o PAT e retorna o usuário', async () => {
    const client = new AzureDevOpsClient(
      async () => response({ authenticatedUser: { providerDisplayName: 'Ericles' } }),
      1000,
      0,
    );

    await expect(client.validate('demo', 'pat')).resolves.toEqual({ displayName: 'Ericles' });
  });

  it('pagina projetos pela continuação', async () => {
    let call = 0;
    const client = new AzureDevOpsClient(
      async () => {
        call += 1;
        if (call === 1) {
          return response(
            { value: [{ id: 'p1', name: 'Um', state: 'wellFormed' }] },
            { headers: { 'x-ms-continuationtoken': 'next' } },
          );
        }
        return response({ value: [{ id: 'p2', name: 'Dois', state: 'wellFormed' }] });
      },
      1000,
      0,
    );

    const projects = await client.listProjects('demo', 'pat');
    expect(projects.map((project) => project.id)).toEqual(['p1', 'p2']);
    expect(call).toBe(2);
  });

  it('mapeia times para o projeto', async () => {
    const client = new AzureDevOpsClient(
      async () =>
        response({
          value: [{ id: 't1', name: 'Time A', description: 'Descrição' }],
        }),
      1000,
      0,
    );

    const teams = await client.listTeams('demo', 'pat', 'p1');
    expect(teams).toEqual([
      { id: 't1', name: 'Time A', projectId: 'p1', description: 'Descrição' },
    ]);
  });

  it('ignora itens incompletos de projetos e times', async () => {
    const client = new AzureDevOpsClient(
      async () =>
        response({
          value: [{ name: 'Sem id' }, { id: 'p1', name: 'Projeto', state: 'wellFormed' }],
        }),
      1000,
      0,
    );

    const projects = await client.listProjects('demo', 'pat');
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe('p1');
  });

  it('rejeita resposta que não é JSON', async () => {
    const client = new AzureDevOpsClient(
      async () => new Response('not-json', { status: 200 }),
      1000,
      0,
    );

    await expect(client.validate('demo', 'pat')).rejects.toMatchObject({
      code: ErrorCode.CONFIG_UNEXPECTED,
    });
  });

  it('mapeia falha de rede', async () => {
    const client = new AzureDevOpsClient(
      async () => {
        throw new Error('offline');
      },
      1000,
      0,
    );

    await expect(client.validate('demo', 'pat')).rejects.toMatchObject({
      code: ErrorCode.CONFIG_NETWORK,
    });
  });

  it.each([
    [401, ErrorCode.CONFIG_PAT_INVALID],
    [403, ErrorCode.CONFIG_FORBIDDEN],
    [404, ErrorCode.CONFIG_ORG_NOT_FOUND],
    [429, ErrorCode.CONFIG_RATE_LIMIT],
    [500, ErrorCode.CONFIG_SERVER],
  ])('mapeia status %i para %s', async (status, code) => {
    const client = new AzureDevOpsClient(
      async () => new Response('{}', { status }),
      1000,
      0,
    );

    await expect(client.validate('demo', 'pat')).rejects.toMatchObject({
      code,
    } satisfies Partial<AppErrorException>);
  });
});
