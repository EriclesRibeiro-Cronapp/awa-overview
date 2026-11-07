import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PullRequestsFilters } from '../../src/renderer/features/pull-requests/pull-requests-filter-bar';
import { EMPTY_PULL_REQUESTS_FILTERS } from '../../src/renderer/features/pull-requests/pull-requests-filters';

function chooseStatus(value: string) {
  fireEvent.click(screen.getByRole('combobox', { name: 'Status' }));
  fireEvent.click(screen.getByRole('option', { name: value }));
}

describe('filtros de Pull requests', () => {
  it('emite busca e status', () => {
    const onChange = vi.fn();
    render(
      <PullRequestsFilters
        filters={EMPTY_PULL_REQUESTS_FILTERS}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '!54678' } });
    expect(onChange).toHaveBeenCalledWith({
      ...EMPTY_PULL_REQUESTS_FILTERS,
      search: '!54678',
    });

    chooseStatus('Concluído');
    expect(onChange).toHaveBeenCalledWith({
      ...EMPTY_PULL_REQUESTS_FILTERS,
      status: 'completed',
    });
  });
});
