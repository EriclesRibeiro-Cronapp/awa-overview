import { describe, expect, it } from 'vitest';
import type { WorkItemTableRow } from '@shared/contracts';
import {
  EMPTY_WORK_ITEMS_FILTERS,
  filterWorkItems,
  uniqueOptions,
} from '../../src/renderer/features/work-items/work-items-filters';

const items: WorkItemTableRow[] = [
  {
    id: 101,
    type: 'Bug',
    title: 'Corrigir login',
    state: 'Active',
    sprint: 'Sprint 1',
    assignedTo: 'Ericles',
    changedAt: '2026-11-02T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_workitems/edit/101',
  },
  {
    id: 102,
    type: 'PBI',
    title: 'Nova tela',
    state: 'New',
    sprint: 'Sprint 2',
    assignedTo: 'Ana',
    changedAt: '2026-11-02T09:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_workitems/edit/102',
  },
];

describe('filtros de Work items', () => {
  it('busca por título e por ID com ou sem #', () => {
    expect(filterWorkItems(items, { ...EMPTY_WORK_ITEMS_FILTERS, search: 'login' })).toHaveLength(1);
    expect(filterWorkItems(items, { ...EMPTY_WORK_ITEMS_FILTERS, search: '#102' })).toHaveLength(1);
    expect(filterWorkItems(items, { ...EMPTY_WORK_ITEMS_FILTERS, search: '102' })).toHaveLength(1);
  });

  it('combina filtros em AND', () => {
    const result = filterWorkItems(items, {
      ...EMPTY_WORK_ITEMS_FILTERS,
      type: 'Bug',
      status: 'inProgress',
      assignee: 'Ericles',
      sprint: 'Sprint 1',
    });
    expect(result.map((item) => item.id)).toEqual([101]);
  });

  it('retorna vazio quando não há correspondência', () => {
    expect(
      filterWorkItems(items, { ...EMPTY_WORK_ITEMS_FILTERS, type: 'Task' }),
    ).toHaveLength(0);
  });

  it('deriva opções únicas e ordenadas', () => {
    expect(uniqueOptions(['Bug', 'PBI', 'Bug', null])).toEqual(['Bug', 'PBI']);
  });
});
