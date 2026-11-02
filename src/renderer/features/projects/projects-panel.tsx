import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ConfigView, ListResult, Project, Team } from '@shared/contracts';
import { Button, EmptyState } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { ProjectSelector } from './project-selector';
import { StalenessBadge } from './staleness-badge';
import { TeamSelector } from './team-selector';

type Success<T> = Extract<ListResult<T>, { ok: true }>;

export function ProjectsPanel({ config }: { config: ConfigView }) {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    config.selectedProjectId,
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(config.selectedTeamId);

  const projectsQuery = useQuery({
    queryKey: ['projects', config.organization],
    queryFn: async (): Promise<Success<Project>> => {
      const result = await window.api.projects.list();
      if (!result.ok) throw new Error(result.error.message);
      return result;
    },
    enabled: config.status === 'configured',
  });

  const teamsQuery = useQuery({
    queryKey: ['teams', config.organization, selectedProjectId],
    queryFn: async (): Promise<Success<Team>> => {
      const result = await window.api.projects.teams({ projectId: selectedProjectId as string });
      if (!result.ok) throw new Error(result.error.message);
      return result;
    },
    enabled: Boolean(selectedProjectId),
  });

  const stale = Boolean(projectsQuery.data?.stale || teamsQuery.data?.stale);

  function handleProjectChange(projectId: string): void {
    setSelectedProjectId(projectId);
    setSelectedTeamId(null);
    void window.api.session.select({ projectId, teamId: null });
    void queryClient.invalidateQueries({ queryKey: ['teams'] });
  }

  function handleTeamChange(teamId: string): void {
    setSelectedTeamId(teamId);
    void window.api.session.select({ projectId: selectedProjectId, teamId });
  }

  return (
    <section className="status-card">
      <h2>{config.organization}</h2>
      <p className="muted">
        {ptBR.config.maskedPat}: ••••{config.patLast4 ?? '----'}
      </p>

      <StalenessBadge stale={stale} />

      {projectsQuery.isLoading ? <p className="muted">{ptBR.app.loading}</p> : null}

      {projectsQuery.isError ? (
        <div>
          <p className="error-text" role="alert">
            {projectsQuery.error instanceof Error
              ? projectsQuery.error.message
              : ptBR.errors.unexpected}
          </p>
          <Button variant="secondary" onClick={() => void projectsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projectsQuery.data?.items.length === 0 ? (
        <EmptyState title={ptBR.projects.project}>{ptBR.projects.selectProject}</EmptyState>
      ) : null}

      {projectsQuery.data && projectsQuery.data.items.length > 0 ? (
        <div className="selector-row">
          <ProjectSelector
            projects={projectsQuery.data.items}
            value={selectedProjectId}
            onChange={handleProjectChange}
            loading={projectsQuery.isFetching}
          />
          <TeamSelector
            teams={teamsQuery.data?.items ?? []}
            value={selectedTeamId}
            onChange={handleTeamChange}
            loading={teamsQuery.isFetching}
            disabled={!selectedProjectId}
          />
        </div>
      ) : null}

      {teamsQuery.isError ? (
        <p className="error-text" role="alert">
          {teamsQuery.error instanceof Error ? teamsQuery.error.message : ptBR.errors.unexpected}
        </p>
      ) : null}
    </section>
  );
}
