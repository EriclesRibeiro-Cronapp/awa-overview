import type { CardResult, PipelineRunSummary } from '@shared/contracts';
import { Button, Tag, type TagType } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { CardMessage, CardShell } from './card-shell';
import { ExternalLink } from './external-link';
import { formatDateTime } from './format';

interface PipelineCardProps {
  card: CardResult<PipelineRunSummary | null> | undefined;
  loading: boolean;
  onRetry: () => void;
}

export function PipelineCard({ card, loading, onRetry }: PipelineCardProps) {
  return (
    <CardShell id="pipelines" title={ptBR.overview.pipelines} icon="rocket-2-line">
      {renderContent(card, loading, onRetry)}
    </CardShell>
  );
}

function renderContent(
  card: CardResult<PipelineRunSummary | null> | undefined,
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
  if (!card.data) return <CardMessage>{ptBR.overview.emptyPipelines}</CardMessage>;

  const item = card.data;
  return (
    <article className="card-item">
      <div className="item-heading">
        <Tag type={tagForPipeline(item)}>{labelForPipeline(item)}</Tag>
        <span className="item-title">{item.name}</span>
      </div>
      <div className="meta-grid meta-grid-2">
        <div className="meta-field">
          <span className="meta-label">{ptBR.overview.startedAt}</span>
          <span className="meta-value">{formatDateTime(item.startedAt)}</span>
        </div>
        <div className="meta-field">
          <span className="meta-label">{ptBR.overview.project}</span>
          <span className="meta-value">{item.project}</span>
        </div>
      </div>
      <ExternalLink url={item.url}>{ptBR.overview.openInAzure}</ExternalLink>
    </article>
  );
}

function tagForPipeline(item: PipelineRunSummary): TagType {
  if (item.status === 'inProgress') return 'info';
  if (item.status === 'notStarted') return 'inactive';
  switch (item.result) {
    case 'succeeded':
      return 'success';
    case 'failed':
      return 'danger';
    case 'partiallySucceeded':
      return 'alert';
    default:
      return 'inactive';
  }
}

function labelForPipeline(item: PipelineRunSummary): string {
  if (item.status === 'inProgress') return ptBR.overview.inProgress;
  if (item.status === 'notStarted') return ptBR.overview.queued;
  switch (item.result) {
    case 'succeeded':
      return ptBR.overview.success;
    case 'failed':
      return ptBR.overview.failure;
    case 'partiallySucceeded':
      return ptBR.overview.partial;
    case 'canceled':
      return ptBR.overview.canceled;
    default:
      return ptBR.overview.unknown;
  }
}
