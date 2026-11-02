import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorkItemTableRow } from '@shared/contracts';
import { WorkItemsFilters } from '../../src/renderer/features/work-items/work-items-filter-bar';
import { EMPTY_WORK_ITEMS_FILTERS } from '../../src/renderer/features/work-items/work-items-filters';

const items: WorkItemTableRow[] = [
  {
    id: 1,
    type: 'Bug',
    title: 'Item',
    state: 'Active',
    sprint: 'Sprint 1',
    assignedTo: 'Ericles',
    changedAt: '2026-11-02T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_workitems/edit/1',
  },
];

describe('barra de filtros', () => {
  it('emite busca e status agrupado', () => {
    const onChange = vi.fn();
    render(
      <WorkItemsFilters
        items={items}
        filters={EMPTY_WORK_ITEMS_FILTERS}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'item' } });
    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_WORK_ITEMS_FILTERS, search: 'item' });

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'inProgress' } });
    expect(onChange).toHaveBeenCalledWith({
      ...EMPTY_WORK_ITEMS_FILTERS,
      status: 'inProgress',
    });
  });
});
