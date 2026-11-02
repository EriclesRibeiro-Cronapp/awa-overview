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
      const pullRequestResult = toCard<PullRequestSummary | null>(
        rejected,
        fallback ? { data: fallback.pullRequest, fetchedAt: fallback.fetchedAt } : null,
        now,
      );
      const pipelineResult = toCard<PipelineRunSummary | null>(
        rejected,
        fallback ? { data: fallback.pipeline, fetchedAt: fallback.fetchedAt } : null,
        now,
      );
      logEvent('overview.identityFailed', {
        organization: input.organization,
        projectId: input.projectId,
        code: toAppError(identityResult.error).code,
      });
      return buildView(context, workItemsResult, pullRequestResult, pipelineResult);
    }

    let [workItems, pullRequest, pipeline] = await Promise.allSettled([
      this.client.listAssignedWorkItems(
        input.organization,
        input.pat,
        input.projectId,
        input.teamId,
      ),
      this.client.getPullRequestNeedingAttention(
        input.organization,
        input.pat,
        input.projectId,
        identityResult.identity,
      ),
      this.client.getLatestPipelineRun(input.organization, input.pat, input.projectId),
    ]);

    workItems = normalizeUnauthorized(workItems);
    pullRequest = normalizeUnauthorized(pullRequest);
    pipeline = normalizeUnauthorized(pipeline);

    const now = new Date().toISOString();
    const fallback = cachedMatches ? cached : null;

    const workItemsResult = toCard<WorkItemSummary[]>(
      workItems,
      fallback ? { data: fallback.workItems, fetchedAt: fallback.fetchedAt } : null,
      now,
    );
    const pullRequestResult = toCard<PullRequestSummary | null>(
      pullRequest,
      fallback ? { data: fallback.pullRequest, fetchedAt: fallback.fetchedAt } : null,
      now,
    );
    const pipelineResult = toCard<PipelineRunSummary | null>(
      pipeline,
      fallback ? { data: fallback.pipeline, fetchedAt: fallback.fetchedAt } : null,
      now,
    );

    for (const [card, result] of [
      ['workItems', workItems],
      ['pullRequest', pullRequest],
      ['pipeline', pipeline],
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
      pullRequest.status === 'fulfilled' &&
      pipeline.status === 'fulfilled'
    ) {
      await this.cache.write({
        schemaVersion: 1,
        contextKey,
        organization: input.organization,
        projectId: input.projectId,
        projectName: input.projectName,
        teamId: input.teamId,
        teamName: input.teamName,
        fetchedAt: now,
        ttlSeconds: this.ttlSeconds,
        workItems: workItems.value,
        pullRequest: pullRequest.value,
        pipeline: pipeline.value,
      });
    }

    const view = buildView(context, workItemsResult, pullRequestResult, pipelineResult);
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
    pullRequest: { ok: true, data: null, stale: false, fetchedAt: timestamp },
    pipeline: { ok: true, data: null, stale: false, fetchedAt: timestamp },
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
    pullRequest: {
      ok: true,
      data: snapshot.pullRequest,
      stale: false,
      fetchedAt: snapshot.fetchedAt,
    },
    pipeline: {
      ok: true,
      data: snapshot.pipeline,
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
  pullRequest: CardResult<PullRequestSummary | null>,
  pipeline: CardResult<PipelineRunSummary | null>,
): OverviewView {
  const timestamps: string[] = [];
  for (const card of [workItems, pullRequest, pipeline]) {
    if (card.ok) timestamps.push(card.fetchedAt);
  }
  timestamps.sort((a, b) => Date.parse(b) - Date.parse(a));

  return {
    context,
    workItems,
    pullRequest,
    pipeline,
    fetchedAt: timestamps[0] ?? null,
    stale: [workItems, pullRequest, pipeline].some((card) => card.ok && card.stale),
  };
}
