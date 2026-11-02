import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PipelinesFilters } from '../../src/renderer/features/pipelines/pipelines-filter-bar';
import { EMPTY_PIPELINES_FILTERS } from '../../src/renderer/features/pipelines/pipelines-filters';

describe('busca de Pipelines', () => {
  it('emite o texto digitado', () => {
    const onChange = vi.fn();
    render(<PipelinesFilters filters={EMPTY_PIPELINES_FILTERS} onChange={onChange} />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'nightly' } });
    expect(onChange).toHaveBeenCalledWith({ search: 'nightly' });
  });
});
