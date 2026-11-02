import { AppErrorException, ErrorCode } from '@shared/errors';
import type { Project, Team } from '@shared/contracts';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface ConnectionDataResponse {
  authenticatedUser?: { providerDisplayName?: string };
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

const API_VERSION = '7.1';
const MAX_PAGES = 20;
const MAX_TEAMS = 100;

export class AzureDevOpsClient {
  constructor(
    private readonly fetchImpl: FetchLike = fetch,
    private readonly timeoutMs = 15_000,
    private readonly maxRetries = 3,
  ) {}

  async validate(organization: string, pat: string): Promise<{ displayName?: string }> {
    const data = await this.request<ConnectionDataResponse>(organization, '/connectionData', pat);
    return { displayName: data.authenticatedUser?.providerDisplayName };
  }

  async validateAccess(organization: string, pat: string): Promise<{ displayName?: string }> {
    const data = await this.request<ConnectionDataResponse>(organization, '/connectionData', pat);
    await this.request<ProjectsResponse>(organization, '/projects', pat, { $top: '1' });
    return { displayName: data.authenticatedUser?.providerDisplayName };
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

  private async request<T>(
    organization: string,
    path: string,
    pat: string,
    query: Record<string, string> = {},
  ): Promise<T> {
    const { body } = await this.requestWithResponse<T>(organization, path, pat, query);
    return body;
  }

  private async requestWithResponse<T>(
    organization: string,
    path: string,
    pat: string,
    query: Record<string, string> = {},
    attempt = 0,
  ): Promise<{ body: T; response: Response }> {
    const url = new URL(`https://dev.azure.com/${encodeURIComponent(organization)}/_apis${path}`);
    url.searchParams.set('api-version', API_VERSION);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (attempt < this.maxRetries) {
        await sleep(backoffMs(attempt));
        return this.requestWithResponse<T>(organization, path, pat, query, attempt + 1);
      }
      throw new AppErrorException(
        ErrorCode.CONFIG_NETWORK,
        error instanceof Error ? error.message : 'Falha de rede',
      );
    }

    if (response.status === 401 || response.status === 203) {
      throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
    }
    if (response.status === 403) throw new AppErrorException(ErrorCode.CONFIG_FORBIDDEN);
    if (response.status === 404) throw new AppErrorException(ErrorCode.CONFIG_ORG_NOT_FOUND);

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (contentType.includes('text/html')) {
      // O Azure DevOps devolve a página de login (HTML) quando o PAT não autentica.
      throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt < this.maxRetries) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoffMs(attempt);
        await sleep(waitMs);
        return this.requestWithResponse<T>(organization, path, pat, query, attempt + 1);
      }
      throw new AppErrorException(
        response.status === 429 ? ErrorCode.CONFIG_RATE_LIMIT : ErrorCode.CONFIG_SERVER,
        `Status ${response.status}`,
      );
    }

    if (!response.ok) {
      throw new AppErrorException(ErrorCode.CONFIG_UNEXPECTED, `Status ${response.status}`);
    }

    try {
      return { body: (await response.json()) as T, response };
    } catch {
      throw new AppErrorException(ErrorCode.CONFIG_UNEXPECTED, 'Resposta inválida do Azure DevOps');
    }
  }
}

function backoffMs(attempt: number): number {
  return Math.min(1_000 * 2 ** attempt, 8_000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
