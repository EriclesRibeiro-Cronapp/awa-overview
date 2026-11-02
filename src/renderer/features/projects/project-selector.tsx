import type { Project } from '@shared/contracts';
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
      <select
        id="project-selector"
        className="select"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || loading || projects.length === 0}
      >
        <option value="">{loading ? ptBR.app.loading : ptBR.projects.selectProject}</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
