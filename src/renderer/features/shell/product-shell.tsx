import type { ReactNode } from 'react';
import {
  RadixTabsContent,
  RadixTabsRoot,
} from '../../components/radix/tabs';
import { ProductTabs, type ProductTabId } from './product-tabs';
import { WindowTitleBar } from './window-title-bar';

interface ProductShellProps {
  activeId: ProductTabId;
  onSelect: (id: ProductTabId) => void;
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

      <RadixTabsRoot
        className="product-tabs-root"
        value={activeId}
        onValueChange={(value) => onSelect(value as ProductTabId)}
      >
        <ProductTabs activeId={activeId} />
        <RadixTabsContent className="product-content" value={activeId}>
          {children}
        </RadixTabsContent>
      </RadixTabsRoot>

      {footer}
    </div>
  );
}
