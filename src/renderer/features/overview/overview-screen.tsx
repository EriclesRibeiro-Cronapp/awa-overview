import type { OverviewView } from '@shared/contracts';
import { Button } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import type { ProjectContextState } from '../shell/use-project-context';
import { PipelineCard } from './pipeline-card';
import { PullRequestCard } from './pull-request-card';
import { WorkItemsCard } from './work-items-card';

interface OverviewScreenProps {
  context: ProjectContextState;
  overview: {
    data: OverviewView | undefined;
    isLoading: boolean;
    isFetching: boolean;
    error: string | null;
    refresh: () => void;
  };
}

export function OverviewScreen({ context, overview }: OverviewScreenProps) {
  if (!context.selectedProjectId) {
    return (
      <section className="overview-empty">
        <h2>{ptBR.overview.selectProjectTitle}</h2>
        <p className="muted">{ptBR.overview.selectProjectBody}</p>
      </section>
    );
  }

  if (overview.error && !overview.data) {
    return (
      <section className="overview-empty">
        <p className="error-text" role="alert">
          {overview.error}
        </p>
        <Button variant="secondary" onClick={overview.refresh}>
          {ptBR.overview.retry}
        </Button>
      </section>
    );
  }

  const data = overview.data;
  return (
    <div className="overview-grid">
      <WorkItemsCard
        card={data?.workItems}
        loading={overview.isLoading}
        onRetry={overview.refresh}
      />
      <div className="overview-right">
        <PipelineCard
          card={data?.pipelines}
          loading={overview.isLoading}
          onRetry={overview.refresh}
        />
        <PullRequestCard
          card={data?.pullRequests}
          loading={overview.isLoading}
          onRetry={overview.refresh}
        />
      </div>
    </div>
  );
}
