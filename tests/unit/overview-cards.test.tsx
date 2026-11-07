import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CardResult, PipelineRunSummary, PullRequestSummary, WorkItemSummary } from '@shared/contracts';
import { PipelineCard } from '../../src/renderer/features/overview/pipeline-card';
import { PullRequestCard } from '../../src/renderer/features/overview/pull-request-card';
import { WorkItemsCard } from '../../src/renderer/features/overview/work-items-card';

const workItem: WorkItemSummary = {
  id: 145672,
  type: 'Bug',
  title: 'Título do Work Item',
  state: 'Backlog',
  project: 'Projeto Teste',
  assignedTo: 'Ericles Ribeiro',
  changedAt: '2026-11-02T10:00:00.000Z',
  priority: 1,
  url: 'https://dev.azure.com/demo/Projeto/_workitems/edit/145672',
};

const pullRequest: PullRequestSummary = {
  id: 5378,
  title: 'Refatorar cliente',
  status: 'Aguardando aprovação',
  project: 'Projeto Teste',
  createdAt: '2026-11-02T10:00:00.000Z',
  url: 'https://dev.azure.com/demo/Projeto/_git/repo/pullrequest/5378',
};

const pipeline: PipelineRunSummary = {
  id: 99,
  name: 'Nightly',
  result: 'succeeded',
  status: 'completed',
  project: 'Projeto Teste',
  startedAt: '2026-11-02T10:00:00.000Z',
  url: 'https://dev.azure.com/demo/Projeto/_build/results?buildId=99',
};

function card<T>(data: T): CardResult<T> {
  return { ok: true, data, stale: false, fetchedAt: '2026-11-02T10:00:00.000Z' };
}

describe('cards do Overview', () => {
  it('mostra work items com tipo, status, projeto e responsável', () => {
    render(<WorkItemsCard card={card([workItem])} loading={false} onRetry={vi.fn()} />);

    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('#145672')).toBeInTheDocument();
    expect(screen.getByText('Título do Work Item')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Projeto Teste')).toBeInTheDocument();
    expect(screen.getByText('Ericles Ribeiro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir no Azure DevOps' })).toBeInTheDocument();
  });

  it('mostra a mensagem vazia exata de work items', () => {
    render(<WorkItemsCard card={card([])} loading={false} onRetry={vi.fn()} />);
    expect(
      screen.getByText('No work items are assigned to you in this view.'),
    ).toBeInTheDocument();
  });

  it('mostra erro e ação de tentar novamente', () => {
    render(
      <WorkItemsCard
        card={{
          ok: false,
          error: { code: 'CFG-005', message: 'Sem rede', retryable: true },
        }}
        loading={false}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Sem rede');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });

  it('mostra o pull request e a mensagem vazia', () => {
    const { rerender } = render(
      <PullRequestCard card={card([pullRequest])} loading={false} onRetry={vi.fn()} />,
    );
    expect(screen.getByText('!5378')).toBeInTheDocument();
    expect(screen.getByText('Aguardando aprovação')).toBeInTheDocument();

    rerender(<PullRequestCard card={card([])} loading={false} onRetry={vi.fn()} />);
    expect(
      screen.getByText('No open pull requests need your attention.'),
    ).toBeInTheDocument();
  });

  it('mostra o pipeline com status e a mensagem vazia', () => {
    const { rerender } = render(
      <PipelineCard card={card([pipeline])} loading={false} onRetry={vi.fn()} />,
    );
    expect(screen.getByText('Sucesso')).toBeInTheDocument();
    expect(screen.getByText('Nightly')).toBeInTheDocument();

    rerender(<PipelineCard card={card([])} loading={false} onRetry={vi.fn()} />);
    expect(
      screen.getByText('No recent pipeline runs were found for your projects.'),
    ).toBeInTheDocument();
  });
});
