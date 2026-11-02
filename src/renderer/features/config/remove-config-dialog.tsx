import { useState } from 'react';
import { Button, Modal } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

interface RemoveConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onRemoved: () => void;
}

export function RemoveConfigDialog({ open, onClose, onRemoved }: RemoveConfigDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  async function confirm(): Promise<void> {
    setError(null);
    setRemoving(true);
    try {
      const result = await window.api.config.remove();
      if (!result.ok) {
        setError(result.error?.message ?? ptBR.errors.unexpected);
        return;
      }
      onRemoved();
    } catch {
      setError(ptBR.errors.unexpected);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={ptBR.config.removeTitle}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={removing}>
            Cancelar
          </Button>
          <Button onClick={() => void confirm()} disabled={removing}>
            {removing ? ptBR.config.removing : ptBR.config.removeAction}
          </Button>
        </>
      }
    >
      <p>{ptBR.config.removeConfirm}</p>
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
