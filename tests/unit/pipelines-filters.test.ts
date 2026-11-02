import { describe, expect, it } from 'vitest';
import type { PipelineTableRow } from '@shared/contracts';
import {
  EMPTY_PIPELINES_FILTERS,
  filterPipelines,
} from '../../src/renderer/features/pipelines/pipelines-filters';

const items: PipelineTableRow[] = [
  {
    id: 1,
    name: 'Nightly regression',
    description: 'Testes em todos os browsers',
    result: 'succeeded',
    status: 'completed',
    project: 'Projeto',
    startedAt: '2026-11-02T10:00:00.000Z',
    finishedAt: '2026-11-02T10:00:51.000Z',
    durationSeconds: 51,
    url: 'https://dev.azure.com/demo/p/_build/results?buildId=1',
  },
  {
    id: 2,
    name: 'Deploy',
    description: 'Produção',
    result: 'failed',
    status: 'completed',
    project: 'Projeto',
    startedAt: '2026-11-01T10:00:00.000Z',
    finishedAt: '2026-11-01T10:01:00.000Z',
    durationSeconds: 60,
    url: 'https://dev.azure.com/demo/p/_build/results?buildId=2',
  },
];

describe('filtros de Pipelines', () => {
  it('busca por nome e descrição', () => {
    expect(
      filterPipelines(items, { ...EMPTY_PIPELINES_FILTERS, search: 'nightly' }),
    ).toHaveLength(1);
    expect(
      filterPipelines(items, { ...EMPTY_PIPELINES_FILTERS, search: 'produção' }),
    ).toHaveLength(1);
  });

  it('retorna vazio sem correspondência', () => {
    expect(
      filterPipelines(items, { ...EMPTY_PIPELINES_FILTERS, search: 'inexistente' }),
    ).toHaveLength(0);
  });
});
