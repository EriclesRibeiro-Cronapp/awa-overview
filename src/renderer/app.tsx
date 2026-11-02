import { useCallback, useEffect, useState } from 'react';
import type { ConfigView } from '@shared/contracts';
import { Button } from './components';
import { ConfigModal } from './features/config/config-modal';
import { FirstRun } from './features/config/first-run';
import { ProjectsPanel } from './features/projects/projects-panel';
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
          <ProjectsPanel config={config} />
        ) : (
          <FirstRun onConfigure={() => setModalOpen(true)} />
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
