import type { PullRequestStatus, PullRequestTableRow } from '@shared/contracts';

export type PullRequestStatusFilter = 'all' | PullRequestStatus;

export interface PullRequestsFilters {
  search: string;
  status: PullRequestStatusFilter;
}

export const EMPTY_PULL_REQUESTS_FILTERS: PullRequestsFilters = {
  search: '',
  status: 'all',
};

export function filterPullRequests(
  items: PullRequestTableRow[],
  filters: PullRequestsFilters,
): PullRequestTableRow[] {
  const search = filters.search.trim().toLowerCase().replace(/^!/, '');
  return items.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search) && !String(item.id).includes(search)) {
      return false;
    }
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    return true;
  });
}
