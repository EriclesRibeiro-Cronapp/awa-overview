import type { OverviewView } from '@shared/contracts';
import { Button, Icon } from '../../components';
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
          card={data?.pipeline}
          loading={overview.isLoading}
          onRetry={overview.refresh}
        />
        <PullRequestCard
          card={data?.pullRequest}
          loading={overview.isLoading}
          onRetry={overview.refresh}
        />
      </div>
    </div>
  );
}

interface OverviewFooterProps {
  fetchedAt: string | null | undefined;
  stale: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  refreshError: string | null;
}

export function OverviewFooter({
  fetchedAt,
  stale,
  refreshing,
  onRefresh,
  refreshError,
}: OverviewFooterProps) {
  return (
    <div className="overview-footer">
      <div className="overview-footer-status">
        <span className="muted">{formatUpdatedAt(fetchedAt)}</span>
        {stale ? (
          <span className="badge-stale" role="status">
            {ptBR.projects.stale}
          </span>
        ) : null}
      </div>
      <Button variant="ghost" onClick={onRefresh} disabled={refreshing}>
        <Icon name="refresh-line" size={16} />
        {refreshing ? ptBR.overview.refreshing : ptBR.overview.refresh}
      </Button>
      {refreshError ? (
        <span className="error-text" role="alert">
          {refreshError}
        </span>
      ) : null}
    </div>
  );
}

function formatUpdatedAt(value: string | null | undefined): string {
  if (!value) return `${ptBR.overview.updatedAt} —`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `${ptBR.overview.updatedAt} —`;
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
  return `${ptBR.overview.updatedAt} ${formatted.replace(', ', ' às ')}h`;
}
