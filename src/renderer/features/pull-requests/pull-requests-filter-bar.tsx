import { Icon } from '../../components';
import { RadixSelect } from '../../components/radix/select';
import { ptBR } from '../../i18n/pt-BR';
import type { PullRequestsFilters } from './pull-requests-filters';

interface PullRequestsFiltersProps {
  filters: PullRequestsFilters;
  onChange: (filters: PullRequestsFilters) => void;
}

export function PullRequestsFilters({ filters, onChange }: PullRequestsFiltersProps) {
  return (
    <section className="pull-requests-filters" aria-label={ptBR.pullRequests.searchLabel}>
      <div className="pull-requests-search">
        <Icon name="filter-3-line" size={16} />
        <input
          className="pull-requests-search-input"
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder={ptBR.pullRequests.search}
          aria-label={ptBR.pullRequests.searchLabel}
        />
      </div>

      <label className="pull-requests-filter">
        <span className="visually-hidden">{ptBR.pullRequests.filterStatus}</span>
        <RadixSelect
          value={filters.status}
          onChange={(value) =>
            onChange({
              ...filters,
              status: value as PullRequestsFilters['status'],
            })
          }
          placeholder={ptBR.pullRequests.filterStatus}
          ariaLabel={ptBR.pullRequests.filterStatus}
          className="pull-requests-filter-select"
          options={[
            { value: 'all', label: ptBR.pullRequests.filterStatus },
            { value: 'active', label: ptBR.pullRequests.statusActive },
            { value: 'completed', label: ptBR.pullRequests.statusCompleted },
            { value: 'abandoned', label: ptBR.pullRequests.statusAbandoned },
          ]}
        />
      </label>
    </section>
  );
}
