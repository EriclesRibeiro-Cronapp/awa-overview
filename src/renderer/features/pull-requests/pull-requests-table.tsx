import { useState } from 'react';
import type { PullRequestTableRow } from '@shared/contracts';
import { pullRequestStatusLabel } from '@shared/pull-requests';
import { Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- a região rolável precisa ser focável para navegação por teclado */

interface PullRequestsTableProps {
  items: PullRequestTableRow[];
  onOpenError: (message: string) => void;
}

export function PullRequestsTable({ items, onOpenError }: PullRequestsTableProps) {
  return (
    <div
      className="pull-requests-table-scroll"
      role="region"
      aria-label={ptBR.pullRequests.tableLabel}
      tabIndex={0}
    >
      <table className="pull-requests-table">
        <caption className="visually-hidden">{ptBR.pullRequests.tableLabel}</caption>
        <colgroup>
          <col className="col-pr-id" />
          <col className="col-pr-title" />
          <col className="col-pr-status" />
          <col className="col-pr-access" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{ptBR.pullRequests.columnId}</th>
            <th scope="col">{ptBR.pullRequests.columnTitle}</th>
            <th scope="col">{ptBR.pullRequests.columnStatus}</th>
            <th scope="col">{ptBR.pullRequests.columnAccess}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="pull-request-id">!{item.id}</td>
              <td>
                <span className="pull-request-title" title={item.title}>
                  {item.title}
                </span>
              </td>
              <td>
                <span className={`pull-request-status status-${item.status}`}>
                  {pullRequestStatusLabel(item.status)}
                </span>
              </td>
              <td>
                <AccessLink item={item} onError={onOpenError} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessLink({
  item,
  onError,
}: {
  item: PullRequestTableRow;
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
      className="pull-requests-access"
      onClick={() => void open()}
      disabled={opening}
      aria-label={`${ptBR.pullRequests.openItem} !${item.id}`}
      title={ptBR.overview.openInAzure}
    >
      <Icon name="share-circle-line" size={16} />
    </button>
  );
}
