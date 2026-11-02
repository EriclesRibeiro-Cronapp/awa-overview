import { Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import type { PipelinesFilters } from './pipelines-filters';

interface PipelinesFiltersProps {
  filters: PipelinesFilters;
  onChange: (filters: PipelinesFilters) => void;
}

export function PipelinesFilters({ filters, onChange }: PipelinesFiltersProps) {
  return (
    <section className="pipelines-filters" aria-label={ptBR.pipelines.searchLabel}>
      <div className="pipelines-search">
        <Icon name="filter-3-line" size={16} />
        <input
          className="pipelines-search-input"
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder={ptBR.pipelines.search}
          aria-label={ptBR.pipelines.searchLabel}
        />
      </div>
    </section>
  );
}
