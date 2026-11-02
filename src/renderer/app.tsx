import { useCallback, useEffect, useState } from 'react';
import type { ConfigView } from '@shared/contracts';
import { ConfigModal } from './features/config/config-modal';
import { FirstRun } from './features/config/first-run';
import { ConfiguredApp } from './features/shell/configured-app';
import { WindowTitleBar } from './features/shell/window-title-bar';
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

  const configModal = (
    <ConfigModal
      key={`${modalOpen ? 'open' : 'closed'}-${config?.organization ?? 'none'}-${config?.status ?? 'none'}`}
      open={modalOpen}
      config={config}
      onClose={() => setModalOpen(false)}
      onSaved={() => {
        void loadConfig();
        setModalOpen(false);
      }}
    />
  );

  if (config === null) {
    return (
      <div className="app-shell">
        <WindowTitleBar />
        <main className="app-content">
          <p>{ptBR.app.loading}</p>
        </main>
        {configModal}
      </div>
    );
  }

  if (configured) {
    return (
      <>
        <ConfiguredApp
          key={config.organization ?? 'organization'}
          config={config}
          onConfigure={() => setModalOpen(true)}
        />
        {configModal}
      </>
    );
  }

  return (
    <div className="app-shell">
      <WindowTitleBar />

      <main className="app-content">
        <FirstRun onConfigure={() => setModalOpen(true)} />
      </main>

      <footer className="app-footer">AWA Overview</footer>
      {configModal}
    </div>
  );
}
