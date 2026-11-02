import { describe, expect, it } from 'vitest';
import type { WorkItemTableRow } from '@shared/contracts';
import {
  EMPTY_WORK_ITEMS_FILTERS,
  filterWorkItems,
} from '../../src/renderer/features/work-items/work-items-filters';

const items: WorkItemTableRow[] = Array.from({ length: 2_000 }, (_, index) => ({
  id: index + 1,
  type: index % 2 === 0 ? 'PBI' : 'Bug',
  title: `Work item ${index + 1}`,
  state: index % 3 === 0 ? 'Closed' : 'Active',
  sprint: `Sprint ${(index % 10) + 1}`,
  assignedTo: index % 2 === 0 ? 'Ericles' : 'Ana',
  changedAt: '2026-11-02T10:00:00.000Z',
  url: `https://dev.azure.com/demo/p/_workitems/edit/${index + 1}`,
}));

describe('performance dos filtros', () => {
  it('filtra 2.000 itens em menos de 200 ms', () => {
    const start = performance.now();
    const result = filterWorkItems(items, {
      ...EMPTY_WORK_ITEMS_FILTERS,
      search: 'item 19',
      type: 'PBI',
      status: 'done',
    });
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(200);
  });
});
