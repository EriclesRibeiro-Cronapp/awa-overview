import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ConfigView, ListResult, Project, Team } from '@shared/contracts';

type Success<T> = Extract<ListResult<T>, { ok: true }>;

export interface ProjectContextState {
  projects: Project[];
  teams: Team[];
  selectedProjectId: string | null;
  selectedTeamId: string | null;
  selectedProject: Project | null;
  selectedTeam: Team | null;
  projectsLoading: boolean;
  teamsLoading: boolean;
  projectsError: string | null;
  teamsError: string | null;
  selectProject: (projectId: string) => void;
  selectTeam: (teamId: string) => void;
  retryProjects: () => void;
  retryTeams: () => void;
}

export function useProjectContext(config: ConfigView): ProjectContextState {
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

  const projects = projectsQuery.data?.items ?? [];
  const teams = teamsQuery.data?.items ?? [];

  function selectProject(projectId: string): void {
    const nextProjectId = projectId || null;
    setSelectedProjectId(nextProjectId);
    setSelectedTeamId(null);
    void window.api.session.select({ projectId: nextProjectId, teamId: null });
    void queryClient.invalidateQueries({ queryKey: ['teams'] });
  }

  function selectTeam(teamId: string): void {
    const nextTeamId = teamId || null;
    setSelectedTeamId(nextTeamId);
    void window.api.session.select({ projectId: selectedProjectId, teamId: nextTeamId });
  }

  return {
    projects,
    teams,
    selectedProjectId,
    selectedTeamId,
    selectedProject: projects.find((project) => project.id === selectedProjectId) ?? null,
    selectedTeam: teams.find((team) => team.id === selectedTeamId) ?? null,
    projectsLoading: projectsQuery.isLoading,
    teamsLoading: teamsQuery.isLoading,
    projectsError: projectsQuery.isError
      ? projectsQuery.error instanceof Error
        ? projectsQuery.error.message
        : null
      : null,
    teamsError: teamsQuery.isError
      ? teamsQuery.error instanceof Error
        ? teamsQuery.error.message
        : null
      : null,
    selectProject,
    selectTeam,
    retryProjects: () => void projectsQuery.refetch(),
    retryTeams: () => void teamsQuery.refetch(),
  };
}
