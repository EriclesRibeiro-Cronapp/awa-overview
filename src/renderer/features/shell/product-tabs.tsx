import { TabList } from '../../components';

export function ProductTabs() {
  return (
    <TabList
      activeId="overview"
      items={[
        { id: 'overview', label: 'Overview', available: true },
        { id: 'work-items', label: 'Work items', available: false },
        { id: 'pull-requests', label: 'Pull requests', available: false },
        { id: 'pipelines', label: 'Pipelines', available: false },
      ]}
    />
  );
}
