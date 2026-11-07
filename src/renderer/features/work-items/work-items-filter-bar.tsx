import type { WorkItemTableRow } from '@shared/contracts';
import { classifyWorkItemState, type WorkItemStateGroup } from '@shared/work-items';
import { Icon } from '../../components';
import { RadixSelect } from '../../components/radix/select';
import { ptBR } from '../../i18n/pt-BR';
import { uniqueOptions, type WorkItemsFilters } from './work-items-filters';

interface WorkItemsFiltersProps {
  items: WorkItemTableRow[];
  filters: WorkItemsFilters;
  onChange: (filters: WorkItemsFilters) => void;
}

const STATUS_LABELS: Record<WorkItemStateGroup, string> = {
  backlog: 'Backlog',
  inProgress: 'Em andamento',
  done: 'Concluído',
  other: 'Outros',
};

export function WorkItemsFilters({ items, filters, onChange }: WorkItemsFiltersProps) {
  const types = uniqueOptions(items.map((item) => item.type));
  const assignees = uniqueOptions(items.map((item) => item.assignedTo));
  const statusGroups = Array.from(
    new Set(items.map((item) => classifyWorkItemState(item.state))),
  );
  const statuses = statusGroups.map((group) => ({
    value: group,
    label: STATUS_LABELS[group],
  }));
  const sprints = uniqueOptions(items.map((item) => item.sprint));

  return (
    <section className="work-items-filters" aria-label={ptBR.workItems.searchLabel}>
      <div className="work-items-search">
        <Icon name="filter-3-line" size={16} />
        <input
          className="work-items-search-input"
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder={ptBR.workItems.search}
          aria-label={ptBR.workItems.searchLabel}
        />
      </div>

      <FilterSelect
        label={ptBR.workItems.filterType}
        value={filters.type}
        options={types.map((value) => ({ value, label: value }))}
        onChange={(value) => onChange({ ...filters, type: value })}
      />
      <FilterSelect
        label={ptBR.workItems.filterAssignee}
        value={filters.assignee}
        options={assignees.map((value) => ({ value, label: value }))}
        onChange={(value) => onChange({ ...filters, assignee: value })}
      />
      <FilterSelect
        label={ptBR.workItems.filterStatus}
        value={filters.status}
        options={statuses}
        onChange={(value) => onChange({ ...filters, status: value })}
      />
      <FilterSelect
        label={ptBR.workItems.filterSprint}
        value={filters.sprint}
        options={sprints.map((value) => ({ value, label: value }))}
        onChange={(value) => onChange({ ...filters, sprint: value })}
      />
    </section>
  );
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="work-items-filter">
      <span className="visually-hidden">{label}</span>
      <RadixSelect
        value={value}
        onChange={onChange}
        placeholder={label}
        ariaLabel={label}
        className="work-items-filter-select"
        options={[{ value: '', label }, ...options]}
      />
    </label>
  );
}
