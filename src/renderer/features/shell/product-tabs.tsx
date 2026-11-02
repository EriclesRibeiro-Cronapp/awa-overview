import { TabList } from '../../components';

export type ProductTabId = 'overview' | 'work-items' | 'pull-requests';

interface ProductTabsProps {
  activeId: ProductTabId;
  onSelect: (id: ProductTabId) => void;
}

export function ProductTabs({ activeId, onSelect }: ProductTabsProps) {
  return (
    <TabList
      activeId={activeId}
      onSelect={(id) => onSelect(id as ProductTabId)}
      items={[
        { id: 'overview', label: 'Overview', available: true },
        { id: 'work-items', label: 'Work items', available: true },
        { id: 'pull-requests', label: 'Pull requests', available: true },
        { id: 'pipelines', label: 'Pipelines', available: false },
      ]}
    />
  );
}
