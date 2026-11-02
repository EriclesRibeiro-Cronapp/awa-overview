import type { CacheSnapshot, Project, Team } from '@shared/contracts';
import { AppErrorException, ErrorCode, type ErrorCodeValue } from '@shared/errors';
import type { AzureDevOpsClient } from './azure-devops-client';
import type { CacheService } from './cache-service';

export interface ProjectsResult {
  items: Project[];
  stale: boolean;
  fetchedAt: string;
}

export interface TeamsResult {
  items: Team[];
  stale: boolean;
  fetchedAt: string;
}

const DEFAULT_TTL_SECONDS = 15 * 60;

export class ProjectsService {
  constructor(
    private readonly client: AzureDevOpsClient,
    private readonly cache: CacheService,
    private readonly ttlSeconds = DEFAULT_TTL_SECONDS,
  ) {}

  async listProjects(
    organization: string,
    pat: string,
    force = false,
  ): Promise<ProjectsResult> {
    const cached = await this.cache.read();
    if (!force && cached && cached.organization === organization && this.cache.isFresh(cached)) {
      return { items: cached.projects, stale: false, fetchedAt: cached.fetchedAt };
    }

    try {
      const projects = await this.client.listProjects(organization, pat);
      const fetchedAt = new Date().toISOString();
      await this.writeSnapshot(
        organization,
        projects,
        cached?.organization === organization ? cached.teamsByProject : {},
        fetchedAt,
      );
      return { items: projects, stale: false, fetchedAt };
    } catch (error) {
      if (cached && cached.organization === organization && isOfflineError(error)) {
        return { items: cached.projects, stale: true, fetchedAt: cached.fetchedAt };
      }
      throw error;
    }
  }

  async listTeams(
    organization: string,
    pat: string,
    projectId: string,
    force = false,
  ): Promise<TeamsResult> {
    const cached = await this.cache.read();
    if (
      !force &&
      cached &&
      cached.organization === organization &&
      this.cache.isFresh(cached) &&
      cached.teamsByProject[projectId]
    ) {
      return { items: cached.teamsByProject[projectId], stale: false, fetchedAt: cached.fetchedAt };
    }

    try {
      const teams = await this.client.listTeams(organization, pat, projectId);
      const fetchedAt = new Date().toISOString();
      await this.writeSnapshot(
        organization,
        cached?.organization === organization ? cached.projects : [],
        {
          ...(cached?.organization === organization ? cached.teamsByProject : {}),
          [projectId]: teams,
        },
        fetchedAt,
      );
      return { items: teams, stale: false, fetchedAt };
    } catch (error) {
      const teams = cached?.teamsByProject[projectId];
      if (cached && cached.organization === organization && teams && isOfflineError(error)) {
        return { items: teams, stale: true, fetchedAt: cached.fetchedAt };
      }
      throw error;
    }
  }

  private async writeSnapshot(
    organization: string,
    projects: Project[],
    teamsByProject: Record<string, Team[]>,
    fetchedAt: string,
  ): Promise<void> {
    const snapshot: CacheSnapshot = {
      schemaVersion: 1,
      organization,
      projects,
      teamsByProject,
      fetchedAt,
      ttlSeconds: this.ttlSeconds,
    };
    await this.cache.write(snapshot);
  }
}

function isOfflineError(error: unknown): boolean {
  if (!(error instanceof AppErrorException)) return false;
  const offlineCodes: ReadonlySet<ErrorCodeValue> = new Set([
    ErrorCode.CONFIG_NETWORK,
    ErrorCode.CONFIG_RATE_LIMIT,
    ErrorCode.CONFIG_SERVER,
  ]);
  return offlineCodes.has(error.code);
}
