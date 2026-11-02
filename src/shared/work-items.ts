import type { WorkItemTableRow, WorkItemsSummary } from './contracts';

export type WorkItemStateGroup = 'backlog' | 'inProgress' | 'done' | 'other';

const BACKLOG = new Set(['new', 'backlog', 'approved', 'to do', 'proposed']);
const IN_PROGRESS = new Set(['active', 'in progress', 'doing', 'committed']);
const DONE = new Set(['closed', 'done', 'resolved', 'completed']);

export function classifyWorkItemState(state: string): WorkItemStateGroup {
  const normalized = state.trim().toLowerCase();
  if (DONE.has(normalized)) return 'done';
  if (IN_PROGRESS.has(normalized)) return 'inProgress';
  if (BACKLOG.has(normalized)) return 'backlog';
  return 'other';
}

export function workItemStateLabel(state: string): string {
  switch (classifyWorkItemState(state)) {
    case 'done':
      return 'Concluído';
    case 'inProgress':
      return 'Em andamento';
    case 'backlog':
      return 'Backlog';
    default:
      return state;
  }
}

export function summarizeWorkItems(items: WorkItemTableRow[]): WorkItemsSummary {
  const summary: WorkItemsSummary = {
    total: items.length,
    backlog: 0,
    inProgress: 0,
    done: 0,
  };

  for (const item of items) {
    const group = classifyWorkItemState(item.state);
    if (group !== 'other') summary[group] += 1;
  }

  return summary;
}
