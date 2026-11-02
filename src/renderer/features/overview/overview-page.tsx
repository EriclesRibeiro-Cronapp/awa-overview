import type { ConfigView } from '@shared/contracts';
import { ProductFooter } from '../shell/product-footer';
import { ProductShell } from '../shell/product-shell';
import type { ProjectContextState } from '../shell/use-project-context';
import { OverviewScreen } from './overview-screen';
import { useOverview } from './use-overview';

interface OverviewPageProps {
  config: ConfigView;
  context: ProjectContextState;
  onConfigure: () => void;
  onSelect: (id: 'overview' | 'work-items' | 'pull-requests' | 'pipelines') => void;
}

export function OverviewPage({
  config,
  context,
  onConfigure,
  onSelect,
}: OverviewPageProps) {
  const overview = useOverview({
    organization: config.organization ?? '',
    projectId: context.selectedProjectId,
    teamId: context.selectedTeamId,
  });

  return (
    <ProductShell
      activeId="overview"
      onSelect={onSelect}
      onConfigure={onConfigure}
      footer={
        <ProductFooter
          context={context}
          fetchedAt={overview.data?.fetchedAt}
          stale={overview.data?.stale ?? false}
          refreshing={overview.isFetching}
          onRefresh={overview.refresh}
          refreshError={overview.refreshError}
        />
      }
    >
      <OverviewScreen context={context} overview={overview} />
    </ProductShell>
  );
}
