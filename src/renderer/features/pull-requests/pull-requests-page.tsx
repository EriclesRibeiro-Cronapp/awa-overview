import type { ConfigView, PullRequestTableRow } from '@shared/contracts';
import { useMemo, useState } from 'react';
import { Button, Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { ProductFooter } from '../shell/product-footer';
import { ProductShell } from '../shell/product-shell';
import type { ProjectContextState } from '../shell/use-project-context';
import {
  EMPTY_PULL_REQUESTS_FILTERS,
  filterPullRequests,
  type PullRequestsFilters,
} from './pull-requests-filters';
import { PullRequestsFilters as PullRequestsFiltersView } from './pull-requests-filter-bar';
import { PullRequestsTable } from './pull-requests-table';
import { usePullRequests } from './use-pull-requests';

const EMPTY_ITEMS: PullRequestTableRow[] = [];

interface PullRequestsPageProps {
  config: ConfigView;
  context: ProjectContextState;
  onConfigure: () => void;
  onSelect: (id: 'overview' | 'work-items' | 'pull-requests' | 'pipelines') => void;
}

export function PullRequestsPage({
  config,
  context,
  onConfigure,
  onSelect,
}: PullRequestsPageProps) {
  const pullRequests = usePullRequests({
    organization: config.organization ?? '',
    projectId: context.selectedProjectId,
  });
  const [filters, setFilters] = useState<PullRequestsFilters>(EMPTY_PULL_REQUESTS_FILTERS);
  const [openError, setOpenError] = useState<string | null>(null);

  const items = pullRequests.data?.items ?? EMPTY_ITEMS;
  const filtered = useMemo(() => filterPullRequests(items, filters), [items, filters]);

  return (
    <ProductShell
      context={context}
      activeId="pull-requests"
      onSelect={onSelect}
      onConfigure={onConfigure}
      footer={
        <ProductFooter
          fetchedAt={pullRequests.data?.fetchedAt}
          stale={pullRequests.data?.stale ?? false}
          refreshing={pullRequests.isFetching}
          onRefresh={pullRequests.refresh}
          refreshError={pullRequests.refreshError}
        />
      }
    >
      <section className="pull-requests-page">
        <h1 className="pull-requests-title">
          <Icon name="git-pull-request-line" size={24} />
          {ptBR.pullRequests.title}
        </h1>

        {!context.selectedProjectId ? (
          <div className="overview-empty">
            <h2>{ptBR.pullRequests.selectProjectTitle}</h2>
            <p className="muted">{ptBR.pullRequests.selectProjectBody}</p>
          </div>
        ) : pullRequests.error && !pullRequests.data ? (
          <div className="overview-empty">
            <p className="error-text" role="alert">
              {pullRequests.error}
            </p>
            <Button variant="secondary" onClick={pullRequests.refresh}>
              {ptBR.overview.retry}
            </Button>
          </div>
        ) : (
          <>
            <PullRequestsFiltersView filters={filters} onChange={setFilters} />

            {pullRequests.isLoading ? (
              <p className="muted" role="status">
                {ptBR.app.loading}
              </p>
            ) : (
              <>
                {pullRequests.data?.truncated ? (
                  <p className="pull-requests-truncated muted">
                    {ptBR.pullRequests.truncated}
                  </p>
                ) : null}

                {openError ? (
                  <p className="error-text" role="alert">
                    {openError}
                  </p>
                ) : null}

                {items.length === 0 ? (
                  <p className="pull-requests-empty muted">{ptBR.pullRequests.empty}</p>
                ) : filtered.length === 0 ? (
                  <p className="pull-requests-empty muted">
                    {ptBR.pullRequests.emptyFilters}
                  </p>
                ) : (
                  <PullRequestsTable items={filtered} onOpenError={setOpenError} />
                )}
              </>
            )}
          </>
        )}
      </section>
    </ProductShell>
  );
}
