import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorkItemTableRow } from '@shared/contracts';
import { WorkItemsSummary } from '../../src/renderer/features/work-items/work-items-summary';
import { WorkItemsTable } from '../../src/renderer/features/work-items/work-items-table';

const items: WorkItemTableRow[] = [
  {
    id: 213456,
    type: 'PBI',
    title: 'Nightly regression suite across all supported browsers and locales',
    state: 'Active',
    sprint: 'Sprint 1',
    assignedTo: 'Ericles',
    changedAt: '2026-11-02T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_workitems/edit/213456',
  },
  {
    id: 213457,
    type: 'Bug',
    title: 'Outro item',
    state: 'Closed',
    sprint: null,
    assignedTo: null,
    changedAt: '2026-11-02T09:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_workitems/edit/213457',
  },
];

describe('tabela e resumo de Work items', () => {
  it('mostra as quatro contagens formatadas', () => {
    render(
      <WorkItemsSummary summary={{ total: 1234, backlog: 56, inProgress: 10, done: 12 }} />,
    );
    expect(screen.getByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('mostra as seis colunas, os dados e o acesso', () => {
    render(<WorkItemsTable items={items} onOpenError={vi.fn()} />);

    for (const header of ['ID', 'Tipo', 'Título', 'Status', 'Sprint', 'Acessar']) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }

    expect(screen.getByText('#213456')).toBeInTheDocument();
    expect(screen.getByText('Nightly regression suite across all supported browsers and locales')).toBeInTheDocument();
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Em andamento', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Abrir work item/ })).toHaveLength(2);
  });
});
