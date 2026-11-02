import type { WorkItemTableRow } from '@shared/contracts';
import { classifyWorkItemState } from '@shared/work-items';

export interface WorkItemsFilters {
  search: string;
  type: string;
  assignee: string;
  status: string;
  sprint: string;
}

export const EMPTY_WORK_ITEMS_FILTERS: WorkItemsFilters = {
  search: '',
  type: '',
  assignee: '',
  status: '',
  sprint: '',
};

export function filterWorkItems(
  items: WorkItemTableRow[],
  filters: WorkItemsFilters,
): WorkItemTableRow[] {
  const search = filters.search.trim().toLowerCase().replace(/^#/, '');
  return items.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search) && !String(item.id).includes(search)) {
      return false;
    }
    if (filters.type && item.type !== filters.type) return false;
    if (filters.assignee && (item.assignedTo ?? '') !== filters.assignee) return false;
    if (filters.status && classifyWorkItemState(item.state) !== filters.status) return false;
    if (filters.sprint && (item.sprint ?? '') !== filters.sprint) return false;
    return true;
  });
}

export function uniqueOptions(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort(
    (a, b) => a.localeCompare(b, 'pt-BR'),
  );
}
