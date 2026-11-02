import { ptBR } from '../i18n/pt-BR';

export interface TabItem {
  id: string;
  label: string;
  available?: boolean;
}

interface TabListProps {
  items: TabItem[];
  activeId: string;
}

export function TabList({ items, activeId }: TabListProps) {
  return (
    <div className="tabs" role="tablist" aria-label={ptBR.overview.tabsLabel}>
      {items.map((item) => {
        const selected = item.id === activeId;
        const available = item.available ?? true;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={`tab${selected ? ' tab-active' : ''}${available ? '' : ' tab-disabled'}`}
            aria-selected={selected}
            aria-disabled={!available}
            tabIndex={selected ? 0 : -1}
            title={available ? undefined : ptBR.overview.comingSoon}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
