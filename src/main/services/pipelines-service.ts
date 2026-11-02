import type { OverviewContext, PipelinesView } from '@shared/contracts';
import { AppErrorException, ErrorCode, toAppError } from '@shared/errors';
import type { AzureDevOpsClient } from './azure-devops-client';
import { logEvent } from './logger';
import type { PipelinesCacheService, PipelinesSnapshot } from './pipelines-cache-service';

const DEFAULT_TTL_SECONDS = 5 * 60;

export interface PipelinesLoadContext {
  organization: string;
  pat: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
  force: boolean;
}

export class PipelinesService {
  constructor(
    private readonly client: AzureDevOpsClient,
    private readonly cache: PipelinesCacheService,
    private readonly ttlSeconds = DEFAULT_TTL_SECONDS,
  ) {}

  async load(input: PipelinesLoadContext): Promise<PipelinesView> {
    const context = buildContext(input);
    const contextKey = buildContextKey(input);
    const cached = await this.cache.read();
    const cachedMatches =
      cached !== null && cached.contextKey === contextKey && cached.organization === input.organization;

    if (!input.force && cachedMatches && this.cache.isFresh(cached)) {
      logEvent('pipelines.loaded', {
        organization: input.organization,
        projectId: input.projectId,
        source: 'cache',
      });
      return viewFromSnapshot(cached, context, false);
    }

    try {
      await this.client.getIdentity(input.organization, input.pat);
    } catch (error) {
      if (cachedMatches) return viewFromSnapshot(cached, context, true);
      throw error;
    }

    try {
      const result = await this.client.listPipelines(
        input.organization,
        input.pat,
        input.projectId,
      );
      const fetchedAt = new Date().toISOString();
      const view: PipelinesView = {
        context,
        items: result.items,
        truncated: result.truncated,
        fetchedAt,
        stale: false,
      };
      await this.cache.write({
        schemaVersion: 1,
        contextKey,
        organization: input.organization,
        projectId: input.projectId,
        projectName: input.projectName,
        teamId: input.teamId,
        teamName: input.teamName,
        fetchedAt,
        ttlSeconds: this.ttlSeconds,
        items: result.items,
        truncated: result.truncated,
      });
      logEvent('pipelines.loaded', {
        organization: input.organization,
        projectId: input.projectId,
        source: 'network',
        count: result.items.length,
        truncated: result.truncated,
      });
      return view;
    } catch (error) {
      const appError = toAppError(error);
      const normalized =
        appError.code === ErrorCode.CONFIG_PAT_INVALID
          ? new AppErrorException(ErrorCode.CONFIG_FORBIDDEN, appError.details)
          : error;
      if (cachedMatches) {
        logEvent('pipelines.cardFailed', {
          organization: input.organization,
          projectId: input.projectId,
          code: toAppError(normalized).code,
          ...(appError.details ? { details: appError.details } : {}),
        });
        return viewFromSnapshot(cached, context, true);
      }
      throw normalized;
    }
  }
}

export function emptyPipelinesView(): PipelinesView {
  return {
    context: null,
    items: [],
    truncated: false,
    fetchedAt: null,
    stale: false,
  };
}

function buildContext(input: PipelinesLoadContext): OverviewContext {
  return {
    organization: input.organization,
    projectId: input.projectId,
    projectName: input.projectName,
    teamId: input.teamId,
    teamName: input.teamName,
  };
}

function buildContextKey(input: PipelinesLoadContext): string {
  return `${input.organization}|${input.projectId}`;
}

function viewFromSnapshot(
  snapshot: PipelinesSnapshot,
  context: OverviewContext,
  stale: boolean,
): PipelinesView {
  return {
    context,
    items: snapshot.items,
    truncated: snapshot.truncated,
    fetchedAt: snapshot.fetchedAt,
    stale,
  };
}
