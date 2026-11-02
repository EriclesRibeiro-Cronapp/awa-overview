import type { ConfigView, PipelineTableRow } from '@shared/contracts';
import { useMemo, useState } from 'react';
import { Button, Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { ProductFooter } from '../shell/product-footer';
import { ProductShell } from '../shell/product-shell';
import type { ProjectContextState } from '../shell/use-project-context';
import {
  EMPTY_PIPELINES_FILTERS,
  filterPipelines,
  type PipelinesFilters,
} from './pipelines-filters';
import { PipelinesFilters as PipelinesFiltersView } from './pipelines-filter-bar';
import { PipelinesTable } from './pipelines-table';
import { usePipelines } from './use-pipelines';

const EMPTY_ITEMS: PipelineTableRow[] = [];

interface PipelinesPageProps {
  config: ConfigView;
  context: ProjectContextState;
  onConfigure: () => void;
  onSelect: (id: 'overview' | 'work-items' | 'pull-requests' | 'pipelines') => void;
}

export function PipelinesPage({
  config,
  context,
  onConfigure,
  onSelect,
}: PipelinesPageProps) {
  const pipelines = usePipelines({
    organization: config.organization ?? '',
    projectId: context.selectedProjectId,
  });
  const [filters, setFilters] = useState<PipelinesFilters>(EMPTY_PIPELINES_FILTERS);
  const [openError, setOpenError] = useState<string | null>(null);

  const items = pipelines.data?.items ?? EMPTY_ITEMS;
  const filtered = useMemo(() => filterPipelines(items, filters), [items, filters]);

  return (
    <ProductShell
      activeId="pipelines"
      onSelect={onSelect}
      onConfigure={onConfigure}
      footer={
        <ProductFooter
          context={context}
          fetchedAt={pipelines.data?.fetchedAt}
          stale={pipelines.data?.stale ?? false}
          refreshing={pipelines.isFetching}
          onRefresh={pipelines.refresh}
          refreshError={pipelines.refreshError}
        />
      }
    >
      <section className="pipelines-page">
        <h1 className="pipelines-title">
          <Icon name="rocket-2-line" size={24} />
          {ptBR.pipelines.title}
        </h1>

        {!context.selectedProjectId ? (
          <div className="overview-empty">
            <h2>{ptBR.pipelines.selectProjectTitle}</h2>
            <p className="muted">{ptBR.pipelines.selectProjectBody}</p>
          </div>
        ) : pipelines.error && !pipelines.data ? (
          <div className="overview-empty">
            <p className="error-text" role="alert">
              {pipelines.error}
            </p>
            <Button variant="secondary" onClick={pipelines.refresh}>
              {ptBR.overview.retry}
            </Button>
          </div>
        ) : (
          <>
            <PipelinesFiltersView filters={filters} onChange={setFilters} />

            {pipelines.isLoading ? (
              <p className="muted" role="status">
                {ptBR.app.loading}
              </p>
            ) : (
              <>
                {pipelines.data?.truncated ? (
                  <p className="pipelines-truncated muted">
                    {ptBR.pipelines.truncated}
                  </p>
                ) : null}

                {openError ? (
                  <p className="error-text" role="alert">
                    {openError}
                  </p>
                ) : null}

                {items.length === 0 ? (
                  <p className="pipelines-empty muted">{ptBR.pipelines.empty}</p>
                ) : filtered.length === 0 ? (
                  <p className="pipelines-empty muted">{ptBR.pipelines.emptyFilters}</p>
                ) : (
                  <PipelinesTable items={filtered} onOpenError={setOpenError} />
                )}
              </>
            )}
          </>
        )}
      </section>
    </ProductShell>
  );
}
