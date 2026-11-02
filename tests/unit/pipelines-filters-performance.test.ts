import { describe, expect, it } from 'vitest';
import type { PipelineTableRow } from '@shared/contracts';
import {
  EMPTY_PIPELINES_FILTERS,
  filterPipelines,
} from '../../src/renderer/features/pipelines/pipelines-filters';

const items: PipelineTableRow[] = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  name: `Pipeline ${index + 1}`,
  description: `Execução ${index + 1}`,
  result: index % 2 === 0 ? 'succeeded' : 'failed',
  status: 'completed',
  project: 'Projeto',
  startedAt: '2026-11-02T10:00:00.000Z',
  finishedAt: '2026-11-02T10:00:51.000Z',
  durationSeconds: 51,
  url: `https://dev.azure.com/demo/p/_build/results?buildId=${index + 1}`,
}));

describe('performance da busca de pipelines', () => {
  it('filtra 500 execuções em menos de 200 ms', () => {
    const start = performance.now();
    const result = filterPipelines(items, {
      ...EMPTY_PIPELINES_FILTERS,
      search: 'pipeline 49',
    });
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(200);
  });
});
