import type { PipelineTableRow } from '@shared/contracts';

export interface PipelinesFilters {
  search: string;
}

export const EMPTY_PIPELINES_FILTERS: PipelinesFilters = {
  search: '',
};

export function filterPipelines(
  items: PipelineTableRow[],
  filters: PipelinesFilters,
): PipelineTableRow[] {
  const search = filters.search.trim().toLowerCase();
  if (!search) return items;
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(search) ||
      (item.description ?? '').toLowerCase().includes(search),
  );
}
