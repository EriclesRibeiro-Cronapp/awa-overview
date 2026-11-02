import type { OverviewContext, WorkItemsView } from '@shared/contracts';
import { AppErrorException, ErrorCode, toAppError } from '@shared/errors';
import { summarizeWorkItems } from '@shared/work-items';
import type { AzureDevOpsClient } from './azure-devops-client';
import { logEvent } from './logger';
import type { WorkItemsCacheService, WorkItemsSnapshot } from './work-items-cache-service';

const DEFAULT_TTL_SECONDS = 5 * 60;

export interface WorkItemsLoadContext {
  organization: string;
  pat: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
  force: boolean;
}

export class WorkItemsService {
  constructor(
    private readonly client: AzureDevOpsClient,
    private readonly cache: WorkItemsCacheService,
    private readonly ttlSeconds = DEFAULT_TTL_SECONDS,
  ) {}

  async load(input: WorkItemsLoadContext): Promise<WorkItemsView> {
    const context = buildContext(input);
    const contextKey = buildContextKey(input);
    const cached = await this.cache.read();
    const cachedMatches =
      cached !== null && cached.contextKey === contextKey && cached.organization === input.organization;

    if (!input.force && cachedMatches && this.cache.isFresh(cached)) {
      logEvent('workItems.loaded', {
        organization: input.organization,
        projectId: input.projectId,
        teamId: input.teamId,
        source: 'cache',
      });
      return viewFromSnapshot(cached, context, false);
    }

    try {
      await this.client.getIdentity(input.organization, input.pat);
    } catch (error) {
      if (cachedMatches) return viewFromSnapshot(cached, context, true);
      const appError = toAppError(error);
      logEvent('workItems.identityFailed', {
        organization: input.organization,
        projectId: input.projectId,
        code: appError.code,
      });
      throw error;
    }

    try {
      const result = await this.client.listWorkItems(
        input.organization,
        input.pat,
        input.projectId,
        input.teamId,
      );
      const fetchedAt = new Date().toISOString();
      const view: WorkItemsView = {
        context,
        items: result.items,
        summary: summarizeWorkItems(result.items),
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
      logEvent('workItems.loaded', {
        organization: input.organization,
        projectId: input.projectId,
        teamId: input.teamId,
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
        logEvent('workItems.cardFailed', {
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

export function emptyWorkItemsView(): WorkItemsView {
  return {
    context: null,
    items: [],
    summary: { total: 0, backlog: 0, inProgress: 0, done: 0 },
    truncated: false,
    fetchedAt: null,
    stale: false,
  };
}

function buildContext(input: WorkItemsLoadContext): OverviewContext {
  return {
    organization: input.organization,
    projectId: input.projectId,
    projectName: input.projectName,
    teamId: input.teamId,
    teamName: input.teamName,
  };
}

function buildContextKey(input: WorkItemsLoadContext): string {
  return `${input.organization}|${input.projectId}|${input.teamId ?? ''}`;
}

function viewFromSnapshot(
  snapshot: WorkItemsSnapshot,
  context: OverviewContext,
  stale: boolean,
): WorkItemsView {
  return {
    context,
    items: snapshot.items,
    summary: summarizeWorkItems(snapshot.items),
    truncated: snapshot.truncated,
    fetchedAt: snapshot.fetchedAt,
    stale,
  };
}
