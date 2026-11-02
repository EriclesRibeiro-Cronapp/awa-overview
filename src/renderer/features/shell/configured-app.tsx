import type { ConfigView } from '@shared/contracts';
import { useState } from 'react';
import { OverviewPage } from '../overview/overview-page';
import { PipelinesPage } from '../pipelines/pipelines-page';
import { PullRequestsPage } from '../pull-requests/pull-requests-page';
import { WorkItemsPage } from '../work-items/work-items-page';
import { useProjectContext } from './use-project-context';

interface ConfiguredAppProps {
  config: ConfigView;
  onConfigure: () => void;
}

export function ConfiguredApp({ config, onConfigure }: ConfiguredAppProps) {
  const context = useProjectContext(config);
  const [activeId, setActiveId] = useState<
    'overview' | 'work-items' | 'pull-requests' | 'pipelines'
  >('overview');

  if (activeId === 'pipelines') {
    return (
      <PipelinesPage
        config={config}
        context={context}
        onConfigure={onConfigure}
        onSelect={setActiveId}
      />
    );
  }

  if (activeId === 'pull-requests') {
    return (
      <PullRequestsPage
        config={config}
        context={context}
        onConfigure={onConfigure}
        onSelect={setActiveId}
      />
    );
  }

  if (activeId === 'work-items') {
    return (
      <WorkItemsPage
        config={config}
        context={context}
        onConfigure={onConfigure}
        onSelect={setActiveId}
      />
    );
  }

  return (
    <OverviewPage
      config={config}
      context={context}
      onConfigure={onConfigure}
      onSelect={setActiveId}
    />
  );
}
