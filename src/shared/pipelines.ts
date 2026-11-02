import type { PipelineResult, PipelineStatus } from './contracts';

export type PipelineTone = 'success' | 'failure' | 'warning' | 'info' | 'muted';

export interface PipelineStatusDescriptor {
  label: string;
  icon: string;
  tone: PipelineTone;
}

export function describePipelineStatus(
  result: PipelineResult,
  status: PipelineStatus,
): PipelineStatusDescriptor {
  if (status === 'inProgress') {
    return { label: 'Em andamento', icon: 'refresh-line', tone: 'info' };
  }
  if (status === 'notStarted') {
    return { label: 'Na fila', icon: 'timer-line', tone: 'muted' };
  }

  switch (result) {
    case 'succeeded':
      return { label: 'Sucesso', icon: 'checkbox-circle-line', tone: 'success' };
    case 'failed':
      return { label: 'Falha', icon: 'close-circle-line', tone: 'failure' };
    case 'partiallySucceeded':
      return { label: 'Parcial', icon: 'spam-line', tone: 'warning' };
    case 'canceled':
      return { label: 'Cancelado', icon: 'subtract-line', tone: 'muted' };
    default:
      return { label: 'Desconhecido', icon: 'spam-line', tone: 'muted' };
  }
}

export function formatPipelineDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${remaining}s`;
}
