import type { PullRequestStatus } from './contracts';

export function pullRequestStatusLabel(status: PullRequestStatus): string {
  switch (status) {
    case 'active':
      return 'Aberto';
    case 'completed':
      return 'Concluído';
    case 'abandoned':
      return 'Abandonado';
    default:
      return 'Desconhecido';
  }
}

export function pullRequestStatusGroup(status: PullRequestStatus): PullRequestStatus {
  return status === 'unknown' ? 'unknown' : status;
}
