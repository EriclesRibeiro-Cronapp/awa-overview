import { Button, Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { ProjectSelector } from '../projects/project-selector';
import { TeamSelector } from '../projects/team-selector';
import type { ProjectContextState } from './use-project-context';

interface ProductFooterProps {
  context: ProjectContextState;
  fetchedAt: string | null | undefined;
  stale: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  refreshError: string | null;
}

export function ProductFooter({
  context,
  fetchedAt,
  stale,
  refreshing,
  onRefresh,
  refreshError,
}: ProductFooterProps) {
  return (
    <footer className="product-footer">
      <div className="product-footer-status">
        <Button
          variant="ghost"
          className="product-footer-refresh"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={refreshing ? ptBR.overview.refreshing : ptBR.overview.refresh}
          title={refreshing ? ptBR.overview.refreshing : ptBR.overview.refresh}
        >
          <Icon name="refresh-line" size={16} />
        </Button>
        <span className="muted">{formatUpdatedAt(fetchedAt)}</span>
        {stale ? (
          <span className="badge-stale" role="status">
            {ptBR.projects.stale}
          </span>
        ) : null}
        {refreshError ? (
          <span className="error-text" role="alert">
            {refreshError}
          </span>
        ) : null}
      </div>

      <div className="product-footer-context">
        <ProjectSelector
          projects={context.projects}
          value={context.selectedProjectId}
          onChange={context.selectProject}
          loading={context.projectsLoading}
        />
        <TeamSelector
          teams={context.teams}
          value={context.selectedTeamId}
          onChange={context.selectTeam}
          loading={context.teamsLoading}
          disabled={!context.selectedProjectId}
        />
      </div>
    </footer>
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
