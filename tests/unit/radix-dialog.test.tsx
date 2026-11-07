import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../../src/renderer/components/Modal';

function Harness({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Modal
        open={open}
        title="Configuração"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        footer={<button type="button">Salvar</button>}
      >
        <label>
          Organização
          <input aria-label="Organização" />
        </label>
      </Modal>
    </>
  );
}

describe('Radix Dialog', () => {
  it('abre com título acessível, recebe foco e restaura o foco ao fechar com ESC', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });

    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Configuração' });
    expect(dialog).toBeInTheDocument();
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('fecha pelo botão de fechar', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onClose).toHaveBeenCalledOnce();
  });
});
