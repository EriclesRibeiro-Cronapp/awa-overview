import { useCallback, useEffect, useState } from 'react';
import type { ConfigView } from '@shared/contracts';
import { Button, EmptyState } from './components';
import { ConfigModal } from './features/config/config-modal';
import { ptBR } from './i18n/pt-BR';

export function App() {
  const [config, setConfig] = useState<ConfigView | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadConfig = useCallback(async (): Promise<void> => {
    try {
      const current = await window.api.config.get();
      setConfig(current);
      setModalOpen(current.status !== 'configured');
    } catch {
      setConfig(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de estado externo
    void loadConfig();
  }, [loadConfig]);

  const configured = config?.status === 'configured';

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-brand">
          AWA <span>{ptBR.app.brandSuffix}</span>
        </h1>
        {configured ? (
          <Button variant="ghost" onClick={() => setModalOpen(true)}>
            {ptBR.config.title}
          </Button>
        ) : null}
      </header>

      <main className="app-content">
        {config === null ? (
          <p>{ptBR.app.loading}</p>
        ) : configured ? (
          <section className="status-card">
            <h2>{config.organization}</h2>
            <p>
              {ptBR.config.maskedPat}: ••••{config.patLast4 ?? '----'}
            </p>
            <EmptyState title={ptBR.projects.project}>
              {ptBR.projects.selectProject}
            </EmptyState>
          </section>
        ) : (
          <section className="status-card">
            <h2>{ptBR.config.requiredTitle}</h2>
            <p>{ptBR.config.requiredBody}</p>
            <Button onClick={() => setModalOpen(true)}>{ptBR.config.save}</Button>
          </section>
        )}
      </main>

      <footer className="app-footer">AWA Overview</footer>

      <ConfigModal
        key={modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        config={config}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          void loadConfig();
          setModalOpen(false);
        }}
      />
    </div>
  );
}
