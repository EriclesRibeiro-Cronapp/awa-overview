import { Icon } from '../../components';
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
        <select
          className="pull-requests-filter-select"
          value={filters.status}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as PullRequestsFilters['status'],
            })
          }
          aria-label={ptBR.pullRequests.filterStatus}
        >
          <option value="all">{ptBR.pullRequests.filterStatus}</option>
          <option value="active">{ptBR.pullRequests.statusActive}</option>
          <option value="completed">{ptBR.pullRequests.statusCompleted}</option>
          <option value="abandoned">{ptBR.pullRequests.statusAbandoned}</option>
        </select>
        <Icon name="arrow-down-s-line" size={16} />
      </label>
    </section>
  );
}
