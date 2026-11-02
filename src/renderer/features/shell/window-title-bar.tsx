import { useState } from 'react';
import awaLogo from '../../assets/awa-logo.png';
import { Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

interface WindowTitleBarProps {
  showSettings?: boolean;
  onConfigure?: () => void;
}

export function WindowTitleBar({ showSettings = false, onConfigure }: WindowTitleBarProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  function minimize(): void {
    void window.api.windowControls.minimize();
  }

  function close(): void {
    void window.api.windowControls.close();
  }

  return (
    <header className="window-titlebar">
      {logoFailed ? (
        <span className="window-logo-fallback">{ptBR.app.title}</span>
      ) : (
        <img
          className="window-logo"
          src={awaLogo}
          width={95}
          height={12}
          alt="AWA Overview"
          draggable={false}
          onError={() => setLogoFailed(true)}
        />
      )}

      <div className="window-titlebar-drag" aria-hidden="true" />

      <div className="window-controls">
        {showSettings && onConfigure ? (
          <button
            type="button"
            className="window-control"
            onClick={onConfigure}
            aria-label={ptBR.config.title}
            title={ptBR.config.title}
          >
            <Icon name="settings-4-line" size={20} />
          </button>
        ) : null}
        <button
          type="button"
          className="window-control"
          onClick={minimize}
          aria-label={ptBR.window.minimize}
          title={ptBR.window.minimize}
        >
          <Icon name="subtract-line" size={24} />
        </button>
        <button
          type="button"
          className="window-control window-control-close"
          onClick={close}
          aria-label={ptBR.window.close}
          title={ptBR.window.close}
        >
          <Icon name="close-line" size={20} />
        </button>
      </div>
    </header>
  );
}
