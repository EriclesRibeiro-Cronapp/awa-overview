import type { CardResult, WorkItemSummary } from '@shared/contracts';
import { Button, Tag, type TagType } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { CardMessage, CardShell } from './card-shell';
import { ExternalLink } from './external-link';

interface WorkItemsCardProps {
  card: CardResult<WorkItemSummary[]> | undefined;
  loading: boolean;
  onRetry: () => void;
}

export function WorkItemsCard({ card, loading, onRetry }: WorkItemsCardProps) {
  return (
    <CardShell id="work-items" title={ptBR.overview.workItems} icon="newspaper-line">
      {renderContent(card, loading, onRetry)}
    </CardShell>
  );
}

function renderContent(
  card: CardResult<WorkItemSummary[]> | undefined,
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
    return <CardMessage>{ptBR.overview.emptyWorkItems}</CardMessage>;
  }

  return (
    <div className="card-list">
      {card.data.map((item) => (
        <article className="card-item" key={item.id}>
          <div className="item-heading">
            <Tag type={tagForWorkItem(item.type)}>{item.type}</Tag>
            <span className="item-id">#{item.id}</span>
            <span className="item-title">{item.title}</span>
          </div>
          <div className="meta-grid">
            <div className="meta-field">
              <span className="meta-label">{ptBR.overview.status}</span>
              <span className="meta-value">{item.state}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">{ptBR.overview.project}</span>
              <span className="meta-value">{item.project}</span>
            </div>
            <div className="meta-field">
              <span className="meta-label">{ptBR.overview.assignedTo}</span>
              <span className="meta-value">{item.assignedTo ?? '—'}</span>
            </div>
          </div>
          <ExternalLink url={item.url}>{ptBR.overview.openInAzure}</ExternalLink>
        </article>
      ))}
    </div>
  );
}

function tagForWorkItem(type: string): TagType {
  switch (type.toLowerCase()) {
    case 'bug':
      return 'danger';
    case 'task':
      return 'success';
    case 'pbi':
    case 'feature':
      return 'info';
    default:
      return 'inactive';
  }
}
