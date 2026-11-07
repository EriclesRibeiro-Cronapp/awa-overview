import type { CardResult, PullRequestSummary } from '@shared/contracts';
import { Button } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { CardMessage, CardShell } from './card-shell';
import { ExternalLink } from './external-link';
import { formatDateTime } from './format';

interface PullRequestCardProps {
  card: CardResult<PullRequestSummary[]> | undefined;
  loading: boolean;
  onRetry: () => void;
}

export function PullRequestCard({ card, loading, onRetry }: PullRequestCardProps) {
  return (
    <CardShell id="pull-requests" title={ptBR.overview.pullRequests} icon="git-pull-request-line">
      {renderContent(card, loading, onRetry)}
    </CardShell>
  );
}

function renderContent(
  card: CardResult<PullRequestSummary[]> | undefined,
  loading: boolean,
  onRetry: () => void,
) {
  if (loading && !card) return <CardMessage role="status">{ptBR.app.loading}</CardMessage>;
  if (!card) return <CardMessage role="status">{ptBR.app.loading}</CardMessage>;
  if (!card.ok) {
    return (
      <>
        <CardMessage role="alert">{card.error.message}</CardMessage>
        <Button variant="secondary" onClick={onRetry}>
          {ptBR.overview.retry}
        </Button>
      </>
    );
  }
  if (card.data.length === 0) {
    return <CardMessage>{ptBR.overview.emptyPullRequests}</CardMessage>;
  }

  return (
    <div className="card-list">
      {card.data.map((item) => (
        <article className="card-item" key={item.id}>
          <div className="item-heading">
            <span className="item-id">!{item.id}</span>
            <span className="item-title">{item.title}</span>
          </div>
          <div className="meta-grid">
            <div className="meta-field">
              <span className="meta-label">{ptBR.overview.createdAt}</span>
              <span className="meta-value">{formatDateTime(item.createdAt)}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">{ptBR.overview.project}</span>
              <span className="meta-value">{item.project}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">{ptBR.overview.status}</span>
              <span className="meta-value">{item.status}</span>
            </div>
          </div>
          <ExternalLink url={item.url}>{ptBR.overview.openInAzure}</ExternalLink>
        </article>
      ))}
    </div>
  );
}
