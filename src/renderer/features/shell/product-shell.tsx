import type { ReactNode } from 'react';
import { ProductTabs } from './product-tabs';
import { WindowTitleBar } from './window-title-bar';

interface ProductShellProps {
  activeId: 'overview' | 'work-items' | 'pull-requests' | 'pipelines';
  onSelect: (id: 'overview' | 'work-items' | 'pull-requests' | 'pipelines') => void;
  onConfigure: () => void;
  footer: ReactNode;
  children: ReactNode;
}

export function ProductShell({
  activeId,
  onSelect,
  onConfigure,
  footer,
  children,
}: ProductShellProps) {
  return (
    <div className="product-shell">
      <WindowTitleBar showSettings onConfigure={onConfigure} />

      <div className="product-divider" />

      <ProductTabs activeId={activeId} onSelect={onSelect} />

      <main className="product-content">{children}</main>

      {footer}
    </div>
  );
}
