import { useState, type FormEvent } from 'react';
import type { ConfigView } from '@shared/contracts';
import { ptBR } from '../../i18n/pt-BR';

export function useConfigForm(config: ConfigView | null, onSaved: () => void) {
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

  return {
    organization,
    setOrganization,
    pat,
    setPat,
    error,
    saving,
    handleSubmit,
  };
}
