import { RadixTabsList, RadixTabsTrigger } from '../../components/radix/tabs';
import { ptBR } from '../../i18n/pt-BR';

export type ProductTabId = 'overview' | 'work-items' | 'pull-requests' | 'pipelines';

interface ProductTabsProps {
  activeId: ProductTabId;
}

const ITEMS: Array<{ id: ProductTabId; label: string; available: boolean }> = [
  { id: 'overview', label: 'Overview', available: true },
  { id: 'work-items', label: 'Work items', available: true },
  { id: 'pull-requests', label: 'Pull requests', available: true },
  { id: 'pipelines', label: 'Pipelines', available: true },
];

export function ProductTabs({ activeId }: ProductTabsProps) {
  return (
    <RadixTabsList className="tabs" aria-label={ptBR.overview.tabsLabel}>
      {ITEMS.map((item) => (
        <RadixTabsTrigger
          key={item.id}
          value={item.id}
          className={`tab${item.id === activeId ? ' tab-active' : ''}${
            item.available ? '' : ' tab-disabled'
          }`}
          disabled={!item.available}
        >
          {item.label}
        </RadixTabsTrigger>
      ))}
    </RadixTabsList>
  );
}
