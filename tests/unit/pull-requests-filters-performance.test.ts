import { describe, expect, it } from 'vitest';
import type { PullRequestTableRow } from '@shared/contracts';
import {
  EMPTY_PULL_REQUESTS_FILTERS,
  filterPullRequests,
} from '../../src/renderer/features/pull-requests/pull-requests-filters';

const items: PullRequestTableRow[] = Array.from({ length: 1_000 }, (_, index) => ({
  id: index + 1,
  title: `Pull request ${index + 1}`,
  status: index % 2 === 0 ? 'active' : 'completed',
  project: 'Projeto',
  createdAt: '2026-11-02T10:00:00.000Z',
  url: `https://dev.azure.com/demo/p/_git/repo/pullrequest/${index + 1}`,
}));

describe('performance dos filtros de PR', () => {
  it('filtra 1.000 PRs em menos de 200 ms', () => {
    const start = performance.now();
    const result = filterPullRequests(items, {
      ...EMPTY_PULL_REQUESTS_FILTERS,
      search: 'pull request 99',
      status: 'completed',
    });
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(200);
  });
});
