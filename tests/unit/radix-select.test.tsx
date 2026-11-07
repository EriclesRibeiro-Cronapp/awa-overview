import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { RadixSelect, type RadixSelectOption } from '../../src/renderer/components/radix/select';

const options: RadixSelectOption[] = [
  { value: '', label: 'Status' },
  { value: 'active', label: 'Ativo' },
  { value: 'completed', label: 'Concluído' },
];

function Harness() {
  const [value, setValue] = useState('');
  return (
    <RadixSelect
      value={value}
      onChange={setValue}
      options={options}
      placeholder="Status"
      ariaLabel="Status"
    />
  );
}

describe('Radix Select', () => {
  it('lista opções, seleciona por clique e persiste o valor controlado', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: 'Status' });

    fireEvent.click(trigger);
    expect(await screen.findByRole('option', { name: 'Concluído' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'Concluído' }));

    await waitFor(() => expect(trigger).toHaveTextContent('Concluído'));
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('mapeia a sentinela __all__ para valor vazio', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: 'Status' });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Ativo' }));
    await waitFor(() => expect(trigger).toHaveTextContent('Ativo'));

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Status' }));
    await waitFor(() => expect(trigger).toHaveTextContent('Status'));
  });

  it('abre e seleciona usando o teclado', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: 'Status' });
    trigger.focus();

    fireEvent.keyDown(trigger, { key: 'Enter' });
    const listbox = await screen.findByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    const active = await screen.findByRole('option', { name: 'Ativo' });
    fireEvent.keyDown(active, { key: 'Enter' });

    await waitFor(() => expect(trigger).toHaveTextContent('Ativo'));
  });
});
