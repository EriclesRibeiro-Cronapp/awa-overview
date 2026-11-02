import { useState } from 'react';
import type { WorkItemTableRow } from '@shared/contracts';
import { classifyWorkItemState, workItemStateLabel } from '@shared/work-items';
import { Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- a região rolável precisa ser focável para navegação por teclado */

interface WorkItemsTableProps {
  items: WorkItemTableRow[];
  onOpenError: (message: string) => void;
}

export function WorkItemsTable({ items, onOpenError }: WorkItemsTableProps) {
  return (
    <div
      className="work-items-table-scroll"
      role="region"
      aria-label={ptBR.workItems.tableLabel}
      tabIndex={0}
    >
      <table className="work-items-table">
        <caption className="visually-hidden">{ptBR.workItems.tableLabel}</caption>
        <colgroup>
          <col className="col-id" />
          <col className="col-type" />
          <col className="col-title" />
          <col className="col-status" />
          <col className="col-sprint" />
          <col className="col-access" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{ptBR.workItems.columnId}</th>
            <th scope="col">{ptBR.workItems.columnType}</th>
            <th scope="col">{ptBR.workItems.columnTitle}</th>
            <th scope="col">{ptBR.workItems.columnStatus}</th>
            <th scope="col">{ptBR.workItems.columnSprint}</th>
            <th scope="col">{ptBR.workItems.columnAccess}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="work-item-id">#{item.id}</td>
              <td>{item.type}</td>
              <td>
                <span className="work-item-title" title={item.title}>
                  {item.title}
                </span>
              </td>
              <td>
                <span className={`work-item-status status-${classifyWorkItemState(item.state)}`}>
                  {workItemStateLabel(item.state)}
                </span>
              </td>
              <td>{item.sprint ?? '—'}</td>
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
  item: WorkItemTableRow;
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
      className="work-items-access"
      onClick={() => void open()}
      disabled={opening}
      aria-label={`${ptBR.workItems.openItem} #${item.id}`}
      title={ptBR.overview.openInAzure}
    >
      <Icon name="share-circle-line" size={16} />
    </button>
  );
}
