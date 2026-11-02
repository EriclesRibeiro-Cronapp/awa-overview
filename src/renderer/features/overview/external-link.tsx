import { useState } from 'react';
import { ptBR } from '../../i18n/pt-BR';

interface ExternalLinkProps {
  url: string;
  children: string;
}

export function ExternalLink({ url, children }: ExternalLinkProps) {
  const [error, setError] = useState<string | null>(null);

  async function open(): Promise<void> {
    setError(null);
    try {
      const result = await window.api.app.openExternal({ url });
      if (!result.ok) setError(result.error.message);
    } catch {
      setError(ptBR.errors.unexpected);
    }
  }

  return (
    <span className="external-link">
      <button type="button" className="link-button" onClick={() => void open()} disabled={!url}>
        {children}
      </button>
      {error ? (
        <span className="error-text" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
