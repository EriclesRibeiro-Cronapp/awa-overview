import { useState, type FormEvent } from 'react';
import type { ConfigView } from '@shared/contracts';
import { Button, Input, Modal } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

interface ConfigModalProps {
  open: boolean;
  config: ConfigView | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ConfigModal({ open, config, onClose, onSaved }: ConfigModalProps) {
  const [organization, setOrganization] = useState(config?.organization ?? '');
  const [pat, setPat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await window.api.config.save({ organization, pat });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onSaved();
    } catch {
      setError(ptBR.errors.unexpected);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={ptBR.config.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="config-form" disabled={saving}>
            {saving ? ptBR.config.saving : ptBR.config.save}
          </Button>
        </>
      }
    >
      <form id="config-form" onSubmit={handleSubmit} noValidate>
        <Input
          label={ptBR.config.organization}
          name="organization"
          placeholder={ptBR.config.organizationPlaceholder}
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          autoComplete="off"
          disabled={saving}
          required
        />
        <Input
          label={ptBR.config.pat}
          name="pat"
          type="password"
          placeholder={ptBR.config.patPlaceholder}
          value={pat}
          onChange={(event) => setPat(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          disabled={saving}
          required
          error={error ?? undefined}
        />
        <details>
          <summary>{ptBR.config.help}</summary>
          <p>
            Crie um PAT em Azure DevOps → User settings → Personal access tokens, com escopos de
            leitura para Project and Team, Work Items, Code e Build. Revogue o token quando não for
            mais necessário.
          </p>
        </details>
      </form>
    </Modal>
  );
}
