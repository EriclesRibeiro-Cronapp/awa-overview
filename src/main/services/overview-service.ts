import type {
  CardResult,
  OverviewContext,
  OverviewView,
  PipelineRunSummary,
  PullRequestSummary,
  WorkItemSummary,
} from '@shared/contracts';
import { AppErrorException, ErrorCode, toAppError } from '@shared/errors';
import type { AzureDevOpsClient } from './azure-devops-client';
import type { OverviewCacheService, OverviewSnapshot } from './overview-cache-service';
import { logEvent } from './logger';

const DEFAULT_TTL_SECONDS = 5 * 60;

export interface OverviewLoadContext {
  organization: string;
  pat: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
  force: boolean;
}

export class OverviewService {
  constructor(
    private readonly client: AzureDevOpsClient,
    private readonly cache: OverviewCacheService,
    private readonly ttlSeconds = DEFAULT_TTL_SECONDS,
  ) {}

  async load(input: OverviewLoadContext): Promise<OverviewView> {
    const context = buildContext(input);
    const contextKey = buildContextKey(input);
    const cached = await this.cache.read();
    const cachedMatches =
      cached !== null && cached.contextKey === contextKey && cached.organization === input.organization;

    if (!input.force && cachedMatches && this.cache.isFresh(cached)) {
      logEvent('overview.loaded', {
        organization: input.organization,
        projectId: input.projectId,
        teamId: input.teamId,
        source: 'cache',
      });
      return viewFromSnapshot(cached, context);
    }

    const identityResult = await this.client
      .getIdentity(input.organization, input.pat)
      .then((identity) => ({ ok: true as const, identity }))
      .catch((error: unknown) => ({ ok: false as const, error }));

    if (!identityResult.ok) {
      const now = new Date().toISOString();
      const fallback = cachedMatches ? cached : null;
      const rejected = { status: 'rejected' as const, reason: identityResult.error };
      const workItemsResult = toCard<WorkItemSummary[]>(
        rejected,
        fallback ? { data: fallback.workItems, fetchedAt: fallback.fetchedAt } : null,
        now,
      );
      const pullRequestsResult = toCard<PullRequestSummary[]>(
        rejected,
        fallback ? { data: fallback.pullRequests, fetchedAt: fallback.fetchedAt } : null,
        now,
      );
      const pipelinesResult = toCard<PipelineRunSummary[]>(
        rejected,
        fallback ? { data: fallback.pipelines, fetchedAt: fallback.fetchedAt } : null,
        now,
      );
      logEvent('overview.identityFailed', {
        organization: input.organization,
        projectId: input.projectId,
        code: toAppError(identityResult.error).code,
      });
      return buildView(context, workItemsResult, pullRequestsResult, pipelinesResult);
    }

    let [workItems, pullRequests, pipelines] = await Promise.allSettled([
      this.client.listAssignedWorkItems(
        input.organization,
        input.pat,
        input.projectId,
        input.teamId,
      ),
      this.client.listRelatedPullRequests(
        input.organization,
        input.pat,
        input.projectId,
        identityResult.identity,
      ),
      this.client.listRecentPipelineRuns(input.organization, input.pat, input.projectId),
    ]);

    workItems = normalizeUnauthorized(workItems);
    pullRequests = normalizeUnauthorized(pullRequests);
    pipelines = normalizeUnauthorized(pipelines);

    const now = new Date().toISOString();
    const fallback = cachedMatches ? cached : null;

    const workItemsResult = toCard<WorkItemSummary[]>(
      workItems,
      fallback ? { data: fallback.workItems, fetchedAt: fallback.fetchedAt } : null,
      now,
    );
    const pullRequestsResult = toCard<PullRequestSummary[]>(
      pullRequests,
      fallback ? { data: fallback.pullRequests, fetchedAt: fallback.fetchedAt } : null,
      now,
    );
    const pipelinesResult = toCard<PipelineRunSummary[]>(
      pipelines,
      fallback ? { data: fallback.pipelines, fetchedAt: fallback.fetchedAt } : null,
      now,
    );

    for (const [card, result] of [
      ['workItems', workItems],
      ['pullRequests', pullRequests],
      ['pipelines', pipelines],
    ] as const) {
      if (result.status === 'rejected') {
        const error = toAppError(result.reason);
        logEvent('overview.cardFailed', {
          organization: input.organization,
          projectId: input.projectId,
          card,
          code: error.code,
          ...(error.details ? { details: error.details } : {}),
        });
      }
    }

    if (
      workItems.status === 'fulfilled' &&
      pullRequests.status === 'fulfilled' &&
      pipelines.status === 'fulfilled'
    ) {
      await this.cache.write({
        schemaVersion: 2,
        contextKey,
        organization: input.organization,
        projectId: input.projectId,
        projectName: input.projectName,
        teamId: input.teamId,
        teamName: input.teamName,
        fetchedAt: now,
        ttlSeconds: this.ttlSeconds,
        workItems: workItems.value,
        pullRequests: pullRequests.value,
        pipelines: pipelines.value,
      });
    }

    const view = buildView(context, workItemsResult, pullRequestsResult, pipelinesResult);
    logEvent('overview.loaded', {
      organization: input.organization,
      projectId: input.projectId,
      teamId: input.teamId,
      source: 'network',
      stale: view.stale,
    });
    return view;
  }
}

export function emptyOverviewView(): OverviewView {
  const timestamp = new Date().toISOString();
  return {
    context: null,
    workItems: { ok: true, data: [], stale: false, fetchedAt: timestamp },
    pullRequests: { ok: true, data: [], stale: false, fetchedAt: timestamp },
    pipelines: { ok: true, data: [], stale: false, fetchedAt: timestamp },
    fetchedAt: null,
    stale: false,
  };
}

function buildContext(input: OverviewLoadContext): OverviewContext {
  return {
    organization: input.organization,
    projectId: input.projectId,
    projectName: input.projectName,
    teamId: input.teamId,
    teamName: input.teamName,
  };
}

function buildContextKey(input: OverviewLoadContext): string {
  return `${input.organization}|${input.projectId}|${input.teamId ?? ''}`;
}

function viewFromSnapshot(snapshot: OverviewSnapshot, context: OverviewContext): OverviewView {
  return {
    context,
    workItems: {
      ok: true,
      data: snapshot.workItems,
      stale: false,
      fetchedAt: snapshot.fetchedAt,
    },
    pullRequests: {
      ok: true,
      data: snapshot.pullRequests,
      stale: false,
      fetchedAt: snapshot.fetchedAt,
    },
    pipelines: {
      ok: true,
      data: snapshot.pipelines,
      stale: false,
      fetchedAt: snapshot.fetchedAt,
    },
    fetchedAt: snapshot.fetchedAt,
    stale: false,
  };
}

function normalizeUnauthorized<T>(result: PromiseSettledResult<T>): PromiseSettledResult<T> {
  if (
    result.status === 'rejected' &&
    toAppError(result.reason).code === ErrorCode.CONFIG_PAT_INVALID
  ) {
    return {
      status: 'rejected',
      reason: new AppErrorException(
        ErrorCode.CONFIG_FORBIDDEN,
        toAppError(result.reason).details,
      ),
    };
  }
  return result;
}

function toCard<T>(
  result: PromiseSettledResult<T>,
  fallback: { data: T; fetchedAt: string } | null,
  now: string,
): CardResult<T> {
  if (result.status === 'fulfilled') {
    return { ok: true, data: result.value, stale: false, fetchedAt: now };
  }
  if (fallback) {
    return { ok: true, data: fallback.data, stale: true, fetchedAt: fallback.fetchedAt };
  }
  return { ok: false, error: toAppError(result.reason) };
}

function buildView(
  context: OverviewContext,
  workItems: CardResult<WorkItemSummary[]>,
  pullRequests: CardResult<PullRequestSummary[]>,
  pipelines: CardResult<PipelineRunSummary[]>,
): OverviewView {
  const timestamps: string[] = [];
  for (const card of [workItems, pullRequests, pipelines]) {
    if (card.ok) timestamps.push(card.fetchedAt);
  }
  timestamps.sort((a, b) => Date.parse(b) - Date.parse(a));

  return {
    context,
    workItems,
    pullRequests,
    pipelines,
    fetchedAt: timestamps[0] ?? null,
    stale: [workItems, pullRequests, pipelines].some((card) => card.ok && card.stale),
  };
}
