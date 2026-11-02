import { describe, expect, it } from 'vitest';
import type { PullRequestTableRow } from '@shared/contracts';
import {
  EMPTY_PULL_REQUESTS_FILTERS,
  filterPullRequests,
} from '../../src/renderer/features/pull-requests/pull-requests-filters';

const items: PullRequestTableRow[] = [
  {
    id: 54678,
    title: 'Refatorar cliente',
    status: 'active',
    project: 'Projeto',
    createdAt: '2026-11-02T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/54678',
  },
  {
    id: 54679,
    title: 'Concluído',
    status: 'completed',
    project: 'Projeto',
    createdAt: '2026-11-01T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/54679',
  },
];

describe('filtros de Pull requests', () => {
  it('busca por ID com/sem ! e por título', () => {
    expect(
      filterPullRequests(items, { ...EMPTY_PULL_REQUESTS_FILTERS, search: '!54678' }),
    ).toHaveLength(1);
    expect(
      filterPullRequests(items, { ...EMPTY_PULL_REQUESTS_FILTERS, search: '54678' }),
    ).toHaveLength(1);
    expect(
      filterPullRequests(items, { ...EMPTY_PULL_REQUESTS_FILTERS, search: 'refatorar' }),
    ).toHaveLength(1);
  });

  it('filtra por status e combina com busca', () => {
    expect(
      filterPullRequests(items, { ...EMPTY_PULL_REQUESTS_FILTERS, status: 'active' }),
    ).toHaveLength(1);
    expect(
      filterPullRequests(items, {
        ...EMPTY_PULL_REQUESTS_FILTERS,
        status: 'completed',
        search: 'refatorar',
      }),
    ).toHaveLength(0);
  });
});
