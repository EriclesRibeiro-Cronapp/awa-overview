import type { ConfigView, WorkItemTableRow } from '@shared/contracts';
import { useMemo, useState } from 'react';
import { Button, Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { ProductFooter } from '../shell/product-footer';
import { ProductShell } from '../shell/product-shell';
import type { ProjectContextState } from '../shell/use-project-context';
import {
  EMPTY_WORK_ITEMS_FILTERS,
  filterWorkItems,
  type WorkItemsFilters,
} from './work-items-filters';
import { WorkItemsFilters as WorkItemsFiltersView } from './work-items-filter-bar';
import { WorkItemsSummary } from './work-items-summary';
import { WorkItemsTable } from './work-items-table';
import { useWorkItems } from './use-work-items';

const EMPTY_ITEMS: WorkItemTableRow[] = [];

interface WorkItemsPageProps {
  config: ConfigView;
  context: ProjectContextState;
  onConfigure: () => void;
  onSelect: (id: 'overview' | 'work-items' | 'pull-requests' | 'pipelines') => void;
}

export function WorkItemsPage({
  config,
  context,
  onConfigure,
  onSelect,
}: WorkItemsPageProps) {
  const workItems = useWorkItems({
    organization: config.organization ?? '',
    projectId: context.selectedProjectId,
    teamId: context.selectedTeamId,
  });
  const [filters, setFilters] = useState<WorkItemsFilters>(EMPTY_WORK_ITEMS_FILTERS);
  const [openError, setOpenError] = useState<string | null>(null);

  const items = workItems.data?.items ?? EMPTY_ITEMS;
  const filtered = useMemo(() => filterWorkItems(items, filters), [items, filters]);

  return (
    <ProductShell
      context={context}
      activeId="work-items"
      onSelect={onSelect}
      onConfigure={onConfigure}
      footer={
        <ProductFooter
          fetchedAt={workItems.data?.fetchedAt}
          stale={workItems.data?.stale ?? false}
          refreshing={workItems.isFetching}
          onRefresh={workItems.refresh}
          refreshError={workItems.refreshError}
        />
      }
    >
      <section className="work-items-page">
        <h1 className="work-items-title">
          <Icon name="newspaper-line" size={24} />
          {ptBR.workItems.title}
        </h1>

        {!context.selectedProjectId ? (
          <div className="overview-empty">
            <h2>{ptBR.workItems.selectProjectTitle}</h2>
            <p className="muted">{ptBR.workItems.selectProjectBody}</p>
          </div>
        ) : workItems.error && !workItems.data ? (
          <div className="overview-empty">
            <p className="error-text" role="alert">
              {workItems.error}
            </p>
            <Button variant="secondary" onClick={workItems.refresh}>
              {ptBR.overview.retry}
            </Button>
          </div>
        ) : (
          <>
            {workItems.data ? <WorkItemsSummary summary={workItems.data.summary} /> : null}

            {workItems.isLoading ? (
              <p className="muted" role="status">
                {ptBR.app.loading}
              </p>
            ) : (
              <>
                <WorkItemsFiltersView
                  items={items}
                  filters={filters}
                  onChange={setFilters}
                />

                {workItems.data?.truncated ? (
                  <p className="work-items-truncated muted">{ptBR.workItems.truncated}</p>
                ) : null}

                {openError ? (
                  <p className="error-text" role="alert">
                    {openError}
                  </p>
                ) : null}

                {items.length === 0 ? (
                  <p className="work-items-empty muted">{ptBR.workItems.empty}</p>
                ) : filtered.length === 0 ? (
                  <p className="work-items-empty muted">{ptBR.workItems.emptyFilters}</p>
                ) : (
                  <WorkItemsTable items={filtered} onOpenError={setOpenError} />
                )}
              </>
            )}
          </>
        )}
      </section>
    </ProductShell>
  );
}
