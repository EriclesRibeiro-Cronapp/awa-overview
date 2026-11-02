import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { IpcApi } from '@shared/contracts';
import { ConfigModal } from '../../src/renderer/features/config/config-modal';

function setApi(save: ReturnType<typeof vi.fn>): void {
  Object.defineProperty(window, 'api', {
    configurable: true,
    value: {
      config: { save, get: vi.fn(), remove: vi.fn() },
    } as unknown as IpcApi,
  });
}

describe('ConfigModal', () => {
  it('envia organização e PAT e conclui no sucesso', async () => {
    const save = vi.fn(async () => ({ ok: true, patLast4: '1234' }));
    const onSaved = vi.fn();
    setApi(save);

    render(<ConfigModal open config={null} onClose={vi.fn()} onSaved={onSaved} />);

    fireEvent.change(screen.getByLabelText('Organização'), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText('Personal Access Token'), {
      target: { value: 'figd_secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(save).toHaveBeenCalledWith({ organization: 'demo', pat: 'figd_secret' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it('mostra erro e não conclui quando a validação falha', async () => {
    const save = vi.fn(async () => ({
      ok: false,
      error: { code: 'CFG-003', message: 'O token é inválido ou expirou.', retryable: false },
    }));
    const onSaved = vi.fn();
    setApi(save);

    render(<ConfigModal open config={null} onClose={vi.fn()} onSaved={onSaved} />);

    fireEvent.change(screen.getByLabelText('Organização'), { target: { value: 'demo' } });
    fireEvent.change(screen.getByLabelText('Personal Access Token'), {
      target: { value: 'bad' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('O token é inválido ou expirou.');
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('exibe a ajuda de criação e revogação do PAT', () => {
    setApi(vi.fn());

    render(<ConfigModal open config={null} onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByText('Como criar e revogar o PAT'));

    expect(screen.getByText(/Personal access tokens/)).toBeInTheDocument();
  });
});
