import { useState } from 'react';
import type { PipelineTableRow } from '@shared/contracts';
import { describePipelineStatus, formatPipelineDuration } from '@shared/pipelines';
import { Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- a região rolável precisa ser focável para navegação por teclado */

interface PipelinesTableProps {
  items: PipelineTableRow[];
  onOpenError: (message: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function PipelinesTable({ items, onOpenError }: PipelinesTableProps) {
  return (
    <div
      className="pipelines-table-scroll"
      role="region"
      aria-label={ptBR.pipelines.tableLabel}
      tabIndex={0}
    >
      <table className="pipelines-table">
        <caption className="visually-hidden">{ptBR.pipelines.tableLabel}</caption>
        <colgroup>
          <col className="col-pipeline-name" />
          <col className="col-pipeline-details" />
          <col className="col-pipeline-executed" />
          <col className="col-pipeline-access" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{ptBR.pipelines.columnPipeline}</th>
            <th scope="col">{ptBR.pipelines.columnDetails}</th>
            <th scope="col">{ptBR.pipelines.columnExecuted}</th>
            <th scope="col">{ptBR.pipelines.columnAccess}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = describePipelineStatus(item.result, item.status);
            return (
              <tr key={item.id}>
                <td>
                  <span className="pipeline-name-cell">
                    <span className={`pipeline-status-icon pipeline-status-${status.tone}`}>
                      <Icon name={status.icon} size={24} label={status.label} />
                    </span>
                    <span className="pipeline-name">{item.name}</span>
                  </span>
                </td>
                <td>
                  <span className="pipeline-details" title={item.description ?? undefined}>
                    {item.description ?? '—'}
                  </span>
                </td>
                <td>
                  <span className="pipeline-executed">
                    <Icon name="calendar-2-line" size={16} />
                    <span>{formatDate(item.startedAt)}</span>
                    <Icon name="timer-line" size={16} />
                    <span>{formatPipelineDuration(item.durationSeconds)}</span>
                  </span>
                </td>
                <td>
                  <AccessLink item={item} onError={onOpenError} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date).replace(', ', ' ');
}

function AccessLink({
  item,
  onError,
}: {
  item: PipelineTableRow;
  onError: (message: string) => void;
}) {
  const [opening, setOpening] = useState(false);

  async function open(): Promise<void> {
    if (opening) return;
    setOpening(true);
    try {
      const result = await window.api.app.openExternal({ url: item.url });
      if (!result.ok) onError(result.error.message);
    } catch {
      onError(ptBR.errors.unexpected);
    } finally {
      setOpening(false);
    }
  }

  return (
    <button
      type="button"
      className="pipelines-access"
      onClick={() => void open()}
      disabled={opening}
      aria-label={`${ptBR.pipelines.openItem} ${item.name}`}
      title={ptBR.overview.openInAzure}
    >
      <Icon name="share-circle-line" size={16} />
    </button>
  );
}
