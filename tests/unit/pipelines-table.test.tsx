import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PipelineTableRow } from '@shared/contracts';
import { PipelinesTable } from '../../src/renderer/features/pipelines/pipelines-table';

const items: PipelineTableRow[] = [
  {
    id: 99,
    name: 'Nightly',
    description: 'Nightly regression',
    result: 'succeeded',
    status: 'completed',
    project: 'Projeto',
    startedAt: '2026-11-02T10:00:00.000Z',
    finishedAt: '2026-11-02T10:00:51.000Z',
    durationSeconds: 51,
    url: 'https://dev.azure.com/demo/p/_build/results?buildId=99',
  },
  {
    id: 100,
    name: 'Deploy',
    description: 'Produção',
    result: 'failed',
    status: 'completed',
    project: 'Projeto',
    startedAt: '2026-11-02T11:00:00.000Z',
    finishedAt: '2026-11-02T11:02:03.000Z',
    durationSeconds: 123,
    url: 'https://dev.azure.com/demo/p/_build/results?buildId=100',
  },
];

describe('tabela de Pipelines', () => {
  it('mostra status, descrição, data, duração e acesso', () => {
    render(<PipelinesTable items={items} onOpenError={vi.fn()} />);

    for (const header of ['Pipeline', 'Detalhes', 'Executado em', 'Acessar']) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
    expect(screen.getByText('Nightly')).toBeInTheDocument();
    expect(screen.getByText('Nightly regression')).toBeInTheDocument();
    expect(screen.getByText('51s')).toBeInTheDocument();
    expect(screen.getByText('2m 3s')).toBeInTheDocument();
    expect(screen.getByLabelText('Sucesso')).toBeInTheDocument();
    expect(screen.getByLabelText('Falha')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Abrir execução/ })).toHaveLength(2);
  });
});
