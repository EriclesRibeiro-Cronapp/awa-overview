import { AppErrorException, ErrorCode } from '@shared/errors';
import type {
  PipelineResult,
  PipelineRunSummary,
  PipelineStatus,
  Project,
  PullRequestSummary,
  Team,
  WorkItemSummary,
} from '@shared/contracts';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface ConnectionDataResponse {
  authenticatedUser?: { id?: string; providerDisplayName?: string };
}

interface ProjectsResponse {
  value?: Array<{
    id?: string;
    name?: string;
    state?: string;
    visibility?: string;
    url?: string;
  }>;
}

interface TeamsResponse {
  value?: Array<{
    id?: string;
    name?: string;
    description?: string;
  }>;
}

interface TeamFieldValuesResponse {
  values?: Array<{ value?: string; includeChildren?: boolean }>;
}

interface WiqlResponse {
  workItems?: Array<{ id?: number }>;
}

interface WorkItemsResponse {
  value?: Array<{ id?: number; fields?: Record<string, unknown> }>;
}

interface PullRequestsResponse {
  value?: Array<{
    pullRequestId?: number;
    title?: string;
    status?: string;
    isDraft?: boolean;
    creationDate?: string;
    repository?: { name?: string; project?: { name?: string } };
    reviewers?: Array<{ id?: string; vote?: number; displayName?: string }>;
    _links?: { web?: { href?: string } };
  }>;
}

interface BuildsResponse {
  value?: Array<{
    id?: number;
    status?: string;
    result?: string;
    startTime?: string;
    queueTime?: string;
    definition?: { name?: string };
    project?: { name?: string };
    _links?: { web?: { href?: string } };
  }>;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  absolute?: boolean;
}

export interface AzureIdentity {
  id: string;
  displayName: string;
}

const API_VERSION = '7.1';
const CONNECTION_DATA_API_VERSION = '7.1-preview.1';
const MAX_PAGES = 20;
const MAX_TEAMS = 100;
const WORK_ITEM_LIMIT = 3;
const WORK_ITEM_FIELDS = [
  'System.Id',
  'System.WorkItemType',
  'System.Title',
  'System.State',
  'System.TeamProject',
  'System.AssignedTo',
  'System.ChangedDate',
].join(',');

export class AzureDevOpsClient {
  constructor(
    private readonly fetchImpl: FetchLike = fetch,
    private readonly timeoutMs = 15_000,
    private readonly maxRetries = 3,
  ) {}

  async validate(organization: string, pat: string): Promise<{ displayName?: string }> {
    const identity = await this.requestConnectionData(organization, pat);
    return { displayName: identity.displayName };
  }

  async validateAccess(organization: string, pat: string): Promise<{ displayName?: string }> {
    const identity = await this.requestConnectionData(organization, pat);
    await this.request<ProjectsResponse>(organization, '/projects', pat, { $top: '1' });
    return { displayName: identity.displayName };
  }

  async getIdentity(organization: string, pat: string): Promise<AzureIdentity> {
    return this.requestConnectionData(organization, pat);
  }

  async listProjects(organization: string, pat: string): Promise<Project[]> {
    const projects: Project[] = [];
    let continuationToken: string | undefined;
    let page = 0;

    do {
      const { body, response } = await this.requestWithResponse<ProjectsResponse>(
        organization,
        '/projects',
        pat,
        {
          $top: '100',
          ...(continuationToken ? { continuationToken } : {}),
        },
      );

      for (const item of body.value ?? []) {
        if (!item.id || !item.name) continue;
        projects.push({
          id: item.id,
          name: item.name,
          state: item.state ?? 'unknown',
          ...(item.visibility ? { visibility: item.visibility } : {}),
          ...(item.url ? { url: item.url } : {}),
        });
      }

      continuationToken = response.headers.get('x-ms-continuationtoken') ?? undefined;
      page += 1;
    } while (continuationToken && page < MAX_PAGES);

    return projects;
  }

  async listTeams(organization: string, pat: string, projectId: string): Promise<Team[]> {
    const { body } = await this.requestWithResponse<TeamsResponse>(
      organization,
      `/projects/${encodeURIComponent(projectId)}/teams`,
      pat,
      { $top: String(MAX_TEAMS) },
    );

    return (body.value ?? [])
      .filter((item) => Boolean(item.id && item.name))
      .map((item) => ({
        id: item.id as string,
        name: item.name as string,
        projectId,
        ...(item.description ? { description: item.description } : {}),
      }));
  }

  async getTeamAreaPath(
    organization: string,
    pat: string,
    projectId: string,
    teamId: string,
  ): Promise<{ value: string; includeChildren: boolean } | null> {
    const { body } = await this.requestWithResponse<TeamFieldValuesResponse>(
      organization,
      `/${encodeURIComponent(projectId)}/${encodeURIComponent(teamId)}/_apis/work/teamsettings/teamfieldvalues`,
      pat,
      {},
      0,
      API_VERSION,
      { absolute: true },
    );

    const first = (body.values ?? []).find(
      (item) => typeof item.value === 'string' && item.value.trim().length > 0,
    );
    if (!first?.value) return null;
    return { value: first.value, includeChildren: Boolean(first.includeChildren) };
  }

  async listAssignedWorkItems(
    organization: string,
    pat: string,
    projectId: string,
    teamId: string | null,
    limit = WORK_ITEM_LIMIT,
  ): Promise<WorkItemSummary[]> {
    const areaPath = teamId
      ? await this.getTeamAreaPath(organization, pat, projectId, teamId).catch(() => null)
      : null;

    const query = buildWorkItemQuery(areaPath);
    const wiql = await this.request<WiqlResponse>(
      organization,
      `/${encodeURIComponent(projectId)}/_apis/wit/wiql`,
      pat,
      {},
      API_VERSION,
      { absolute: true, method: 'POST', body: { query } },
    );

    const ids = (wiql.workItems ?? [])
      .map((item) => item.id)
      .filter((id): id is number => typeof id === 'number')
      .slice(0, limit);

    if (ids.length === 0) return [];

    const { body } = await this.requestWithResponse<WorkItemsResponse>(
      organization,
      '/wit/workitems',
      pat,
      { ids: ids.join(','), fields: WORK_ITEM_FIELDS },
    );

    const byId = new Map((body.value ?? []).map((item) => [item.id, item]));
    return ids
      .map((id) => mapWorkItem(byId.get(id), organization, projectId))
      .filter((item): item is WorkItemSummary => item !== null);
  }

  async getPullRequestNeedingAttention(
    organization: string,
    pat: string,
    projectId: string,
    identity?: AzureIdentity,
  ): Promise<PullRequestSummary | null> {
    const user = identity ?? (await this.getIdentity(organization, pat));
    const query: Record<string, string> = {
      'searchCriteria.status': 'active',
      $top: user.id ? '10' : '50',
    };
    if (user.id) query['searchCriteria.reviewerId'] = user.id;

    const { body } = await this.requestWithResponse<PullRequestsResponse>(
      organization,
      `/${encodeURIComponent(projectId)}/_apis/git/pullrequests`,
      pat,
      query,
      0,
      API_VERSION,
      { absolute: true },
    );

    const candidates = (body.value ?? [])
      .filter((pr) => {
        if (!pr.pullRequestId || !pr.title) return false;
        if (pr.status && pr.status !== 'active') return false;
        if (!user.id) return true;
        const reviewer = (pr.reviewers ?? []).find((item) => item.id === user.id);
        return !reviewer || reviewer.vote !== 10;
      })
      .sort((a, b) => Date.parse(b.creationDate ?? '') - Date.parse(a.creationDate ?? ''));

    const pr = candidates[0];
    if (!pr?.pullRequestId) return null;

    const myVote = user.id
      ? (pr.reviewers ?? []).find((item) => item.id === user.id)?.vote
      : undefined;
    const status = pr.isDraft
      ? 'Rascunho'
      : myVote === 0 || myVote === -5
        ? 'Aguardando aprovação'
        : 'Ativo';
    const project = pr.repository?.project?.name ?? projectId;
    const repositoryName = pr.repository?.name;
    const url =
      pr._links?.web?.href ??
      (repositoryName
        ? `https://dev.azure.com/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/_git/${encodeURIComponent(repositoryName)}/pullrequest/${pr.pullRequestId}`
        : '');

    return {
      id: pr.pullRequestId,
      title: pr.title ?? 'Pull request sem título',
      status,
      project,
      createdAt: pr.creationDate ?? '',
      url,
    };
  }

  async getLatestPipelineRun(
    organization: string,
    pat: string,
    projectId: string,
  ): Promise<PipelineRunSummary | null> {
    const { body } = await this.requestWithResponse<BuildsResponse>(
      organization,
      `/${encodeURIComponent(projectId)}/_apis/build/builds`,
      pat,
      { $top: '1', queryOrder: 'finishTimeDescending' },
      0,
      API_VERSION,
      { absolute: true },
    );

    const build = body.value?.[0];
    if (!build?.id) return null;

    return {
      id: build.id,
      name: build.definition?.name ?? 'Pipeline',
      result: mapPipelineResult(build.result),
      status: mapPipelineStatus(build.status),
      project: build.project?.name ?? projectId,
      startedAt: build.startTime ?? build.queueTime ?? null,
      url: build._links?.web?.href ?? '',
    };
  }

  private async requestConnectionData(
    organization: string,
    pat: string,
  ): Promise<AzureIdentity> {
    const data = await this.request<ConnectionDataResponse>(
      organization,
      '/connectionData',
      pat,
      {},
      CONNECTION_DATA_API_VERSION,
    );
    const displayName = data.authenticatedUser?.providerDisplayName;
    if (!displayName || displayName === 'Anonymous') {
      throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
    }
    return { id: data.authenticatedUser?.id ?? '', displayName };
  }

  private async request<T>(
    organization: string,
    path: string,
    pat: string,
    query: Record<string, string> = {},
    apiVersion = API_VERSION,
    options: RequestOptions = {},
  ): Promise<T> {
    const { body } = await this.requestWithResponse<T>(
      organization,
      path,
      pat,
      query,
      0,
      apiVersion,
      options,
    );
    return body;
  }

  private async requestWithResponse<T>(
    organization: string,
    path: string,
    pat: string,
    query: Record<string, string> = {},
    attempt = 0,
    apiVersion = API_VERSION,
    options: RequestOptions = {},
  ): Promise<{ body: T; response: Response }> {
    const suffix = options.absolute ? path : `/_apis${path}`;
    const url = new URL(`https://dev.azure.com/${encodeURIComponent(organization)}${suffix}`);
    url.searchParams.set('api-version', apiVersion);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: options.method ?? 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`,
          Accept: 'application/json',
          'X-TFS-FedAuthRedirect': 'Suppress',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (attempt < this.maxRetries) {
        await sleep(backoffMs(attempt));
        return this.requestWithResponse<T>(
          organization,
          path,
          pat,
          query,
          attempt + 1,
          apiVersion,
          options,
        );
      }
      throw new AppErrorException(
        ErrorCode.CONFIG_NETWORK,
        error instanceof Error ? error.message : 'Falha de rede',
      );
    }

    if (response.status === 401 || response.status === 203) {
      throw new AppErrorException(
        ErrorCode.CONFIG_PAT_INVALID,
        `Status ${response.status} em ${path}`,
      );
    }
    if (response.status === 403) throw new AppErrorException(ErrorCode.CONFIG_FORBIDDEN);
    if (response.status === 404) throw new AppErrorException(ErrorCode.CONFIG_ORG_NOT_FOUND);

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (contentType.includes('text/html')) {
      throw new AppErrorException(
        ErrorCode.CONFIG_PAT_INVALID,
        `HTML de login (${contentType}) em ${path}`,
      );
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt < this.maxRetries) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoffMs(attempt);
        await sleep(waitMs);
        return this.requestWithResponse<T>(
          organization,
          path,
          pat,
          query,
          attempt + 1,
          apiVersion,
          options,
        );
      }
      throw new AppErrorException(
        response.status === 429 ? ErrorCode.CONFIG_RATE_LIMIT : ErrorCode.CONFIG_SERVER,
        `Status ${response.status} em ${path}`,
      );
    }

    if (!response.ok) {
      throw new AppErrorException(ErrorCode.CONFIG_UNEXPECTED, `Status ${response.status} em ${path}`);
    }

    try {
      return { body: (await response.json()) as T, response };
    } catch {
      throw new AppErrorException(
        ErrorCode.CONFIG_UNEXPECTED,
        `Resposta inválida do Azure DevOps em ${path}`,
      );
    }
  }
}

function buildWorkItemQuery(areaPath: { value: string; includeChildren: boolean } | null): string {
  const clauses = [
    '[System.TeamProject] = @project',
    '[System.AssignedTo] = @Me',
    "[System.State] NOT IN ('Closed', 'Done', 'Removed')",
  ];
  if (areaPath) {
    const operator = areaPath.includeChildren ? 'UNDER' : '=';
    clauses.push(`[System.AreaPath] ${operator} '${areaPath.value.replace(/'/g, "''")}'`);
  }
  return `SELECT [System.Id] FROM WorkItems WHERE ${clauses.join(' AND ')} ORDER BY [System.ChangedDate] DESC`;
}

function mapWorkItem(
  item: { id?: number; fields?: Record<string, unknown> } | undefined,
  organization: string,
  fallbackProject: string,
): WorkItemSummary | null {
  if (!item?.id) return null;
  const fields = item.fields ?? {};
  const title = readString(fields['System.Title']);
  if (!title) return null;

  const project = readString(fields['System.TeamProject']) ?? fallbackProject;
  const assigned = fields['System.AssignedTo'];
  const assignedTo =
    typeof assigned === 'string'
      ? assigned
      : isRecord(assigned) && typeof assigned.displayName === 'string'
        ? assigned.displayName
        : null;

  return {
    id: item.id,
    type: readString(fields['System.WorkItemType']) ?? 'Work item',
    title,
    state: readString(fields['System.State']) ?? 'Desconhecido',
    project,
    assignedTo,
    changedAt: readString(fields['System.ChangedDate']) ?? '',
    url: `https://dev.azure.com/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/_workitems/edit/${item.id}`,
  };
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapPipelineResult(result: string | undefined): PipelineResult {
  switch (result) {
    case 'succeeded':
    case 'failed':
    case 'partiallySucceeded':
    case 'canceled':
      return result;
    default:
      return 'unknown';
  }
}

function mapPipelineStatus(status: string | undefined): PipelineStatus {
  switch (status) {
    case 'completed':
    case 'inProgress':
    case 'notStarted':
      return status;
    default:
      return 'unknown';
  }
}

function backoffMs(attempt: number): number {
  return Math.min(1_000 * 2 ** attempt, 8_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
