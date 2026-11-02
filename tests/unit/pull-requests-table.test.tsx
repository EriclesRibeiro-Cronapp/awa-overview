import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PullRequestTableRow } from '@shared/contracts';
import { PullRequestsTable } from '../../src/renderer/features/pull-requests/pull-requests-table';

const items: PullRequestTableRow[] = [
  {
    id: 54678,
    title: 'Refatorar o cliente do Azure DevOps',
    status: 'active',
    project: 'Projeto',
    createdAt: '2026-11-02T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/54678',
  },
  {
    id: 54679,
    title: 'PR concluído',
    status: 'completed',
    project: 'Projeto',
    createdAt: '2026-11-01T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/54679',
  },
  {
    id: 54680,
    title: 'PR abandonado',
    status: 'abandoned',
    project: 'Projeto',
    createdAt: '2026-10-31T10:00:00.000Z',
    url: 'https://dev.azure.com/demo/p/_git/repo/pullrequest/54680',
  },
];

describe('tabela de Pull requests', () => {
  it('mostra ID com !, título, status e acesso', () => {
    render(<PullRequestsTable items={items} onOpenError={vi.fn()} />);

    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Título' })).toBeInTheDocument();
    expect(screen.getByText('!54678')).toBeInTheDocument();
    expect(screen.getByText('Aberto')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('Abandonado')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Abrir pull request/ })).toHaveLength(3);
  });
});
