import type { Project } from '@shared/contracts';
import { RadixSelect } from '../../components/radix/select';
import { ptBR } from '../../i18n/pt-BR';

interface ProjectSelectorProps {
  projects: Project[];
  value: string | null;
  onChange: (projectId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ProjectSelector({
  projects,
  value,
  onChange,
  loading = false,
  disabled = false,
}: ProjectSelectorProps) {
  return (
    <div className="selector">
      <label htmlFor="project-selector">{ptBR.projects.project}</label>
      <RadixSelect
        id="project-selector"
        value={value ?? ''}
        onChange={onChange}
        placeholder={loading ? ptBR.app.loading : ptBR.projects.selectProject}
        ariaLabel={ptBR.projects.project}
        loading={loading}
        disabled={disabled || projects.length === 0}
        options={[
          {
            value: '',
            label: loading ? ptBR.app.loading : ptBR.projects.selectProject,
          },
          ...projects.map((project) => ({ value: project.id, label: project.name })),
        ]}
      />
    </div>
  );
}
