import type { ConfigView } from '@shared/contracts';
import { ProductShell } from '../shell/product-shell';
import { useProjectContext } from '../shell/use-project-context';
import { OverviewFooter, OverviewScreen } from './overview-screen';
import { useOverview } from './use-overview';

interface OverviewPageProps {
  config: ConfigView;
  onConfigure: () => void;
}

export function OverviewPage({ config, onConfigure }: OverviewPageProps) {
  const context = useProjectContext(config);
  const overview = useOverview({
    organization: config.organization ?? '',
    projectId: context.selectedProjectId,
    teamId: context.selectedTeamId,
  });

  return (
    <ProductShell
      context={context}
      onConfigure={onConfigure}
      footer={
        <OverviewFooter
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
