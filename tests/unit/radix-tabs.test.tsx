import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  RadixTabsContent,
  RadixTabsList,
  RadixTabsRoot,
  RadixTabsTrigger,
} from '../../src/renderer/components/radix/tabs';

function Harness() {
  const [value, setValue] = useState('overview');

  return (
    <RadixTabsRoot value={value} onValueChange={setValue}>
      <RadixTabsList aria-label="Seções">
        <RadixTabsTrigger value="overview">Overview</RadixTabsTrigger>
        <RadixTabsTrigger value="work-items">Work items</RadixTabsTrigger>
        <RadixTabsTrigger value="pipelines">Pipelines</RadixTabsTrigger>
      </RadixTabsList>
      <RadixTabsContent value="overview">Conteúdo Overview</RadixTabsContent>
      <RadixTabsContent value="work-items">Conteúdo Work items</RadixTabsContent>
      <RadixTabsContent value="pipelines">Conteúdo Pipelines</RadixTabsContent>
    </RadixTabsRoot>
  );
}

describe('Radix Tabs', () => {
  it('ativa a aba clicada e mantém o conteúdo correspondente', async () => {
    render(<Harness />);

    const overview = screen.getByRole('tab', { name: 'Overview' });
    const workItems = screen.getByRole('tab', { name: 'Work items' });
    expect(overview).toHaveAttribute('aria-selected', 'true');

    fireEvent.mouseDown(workItems, { button: 0, ctrlKey: false });
    fireEvent.click(workItems);

    await waitFor(() => expect(workItems).toHaveAttribute('aria-selected', 'true'));
    expect(screen.getByText('Conteúdo Work items')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Overview')).not.toBeInTheDocument();
  });

  it('navega com as setas do teclado', async () => {
    render(<Harness />);

    const overview = screen.getByRole('tab', { name: 'Overview' });
    overview.focus();
    fireEvent.keyDown(overview, { key: 'ArrowRight' });

    const workItems = screen.getByRole('tab', { name: 'Work items' });
    await waitFor(() => expect(workItems).toHaveAttribute('aria-selected', 'true'));
    expect(workItems).toHaveFocus();
  });
});
