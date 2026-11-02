import type { ReactNode } from 'react';
import { Button, Icon } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { ProjectSelector } from '../projects/project-selector';
import { TeamSelector } from '../projects/team-selector';
import { ProductTabs } from './product-tabs';
import type { ProjectContextState } from './use-project-context';

interface ProductShellProps {
  context: ProjectContextState;
  onConfigure: () => void;
  footer: ReactNode;
  children: ReactNode;
}

export function ProductShell({ context, onConfigure, footer, children }: ProductShellProps) {
  return (
    <div className="product-shell">
      <header className="product-header">
        <h1 className="app-brand">
          AWA <span>• Overview</span>
        </h1>

        <div className="header-context">
          <ProjectSelector
            projects={context.projects}
            value={context.selectedProjectId}
            onChange={context.selectProject}
            loading={context.projectsLoading}
          />
          <TeamSelector
            teams={context.teams}
            value={context.selectedTeamId}
            onChange={context.selectTeam}
            loading={context.teamsLoading}
            disabled={!context.selectedProjectId}
          />
        </div>

        <Button
          className="icon-btn"
          variant="ghost"
          onClick={onConfigure}
          aria-label={ptBR.config.title}
        >
          <Icon name="settings-4-line" size={20} />
        </Button>
      </header>

      <div className="product-divider" />

      <ProductTabs />

      <main className="product-content">{children}</main>

      <footer className="product-footer">{footer}</footer>
    </div>
  );
}
