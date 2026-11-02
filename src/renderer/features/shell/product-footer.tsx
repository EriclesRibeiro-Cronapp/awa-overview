import { Button, Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

interface ProductFooterProps {
  fetchedAt: string | null | undefined;
  stale: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  refreshError: string | null;
}

export function ProductFooter({
  fetchedAt,
  stale,
  refreshing,
  onRefresh,
  refreshError,
}: ProductFooterProps) {
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
