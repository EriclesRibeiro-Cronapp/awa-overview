export type ConfigStatus = 'unconfigured' | 'configured' | 'invalid';

export interface ConfigView {
  organization: string | null;
  status: ConfigStatus;
  hasPat: boolean;
  patLast4: string | null;
  selectedProjectId: string | null;
  selectedTeamId: string | null;
  lastValidatedAt: string | null;
}

export interface AppError {
  code: string;
  message: string;
  retryable: boolean;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  state: string;
  visibility?: string;
  url?: string;
}

export interface Team {
  id: string;
  name: string;
  projectId: string;
  description?: string;
}

export interface CacheSnapshot {
  schemaVersion: number;
  organization: string;
  projects: Project[];
  teamsByProject: Record<string, Team[]>;
  fetchedAt: string;
  ttlSeconds: number;
}

export interface SaveConfigInput {
  organization: string;
  pat: string;
}

export type SaveConfigResult =
  | { ok: true; patLast4: string; user?: { displayName: string } }
  | { ok: false; error: AppError };

export type ListResult<T> =
  | { ok: true; items: T[]; stale: boolean; fetchedAt: string }
  | { ok: false; error: AppError };

export interface WorkItemSummary {
  id: number;
  type: string;
  title: string;
  state: string;
  project: string;
  assignedTo: string | null;
  changedAt: string;
  priority: number | null;
  url: string;
}

export interface PullRequestSummary {
  id: number;
  title: string;
  status: string;
  project: string;
  createdAt: string;
  url: string;
}

export type PipelineResult =
  | 'succeeded'
  | 'failed'
  | 'partiallySucceeded'
  | 'canceled'
  | 'unknown';

export type PipelineStatus = 'completed' | 'inProgress' | 'notStarted' | 'unknown';

export interface PipelineRunSummary {
  id: number;
  name: string;
  result: PipelineResult;
  status: PipelineStatus;
  project: string;
  startedAt: string | null;
  url: string;
}

export interface OverviewContext {
  organization: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
}

export type CardResult<T> =
  | { ok: true; data: T; stale: boolean; fetchedAt: string }
  | { ok: false; error: AppError; stale?: boolean; fetchedAt?: string };

export interface OverviewView {
  context: OverviewContext | null;
  workItems: CardResult<WorkItemSummary[]>;
  pullRequests: CardResult<PullRequestSummary[]>;
  pipelines: CardResult<PipelineRunSummary[]>;
  fetchedAt: string | null;
  stale: boolean;
}

export interface WorkItemTableRow {
  id: number;
  type: string;
  title: string;
  state: string;
  sprint: string | null;
  assignedTo: string | null;
  changedAt: string;
  url: string;
}

export interface WorkItemsSummary {
  total: number;
  backlog: number;
  inProgress: number;
  done: number;
}

export interface WorkItemsView {
  context: OverviewContext | null;
  items: WorkItemTableRow[];
  summary: WorkItemsSummary;
  truncated: boolean;
  fetchedAt: string | null;
  stale: boolean;
}

export interface WorkItemsLoadInput {
  force?: boolean;
}

export type WorkItemsLoadResult =
  | { ok: true; data: WorkItemsView }
  | { ok: false; error: AppError };

export type PullRequestStatus = 'active' | 'completed' | 'abandoned' | 'unknown';

export interface PullRequestTableRow {
  id: number;
  title: string;
  status: PullRequestStatus;
  project: string;
  createdAt: string;
  url: string;
}

export interface PullRequestsView {
  context: OverviewContext | null;
  items: PullRequestTableRow[];
  truncated: boolean;
  fetchedAt: string | null;
  stale: boolean;
}

export interface PullRequestsLoadInput {
  force?: boolean;
}

export type PullRequestsLoadResult =
  | { ok: true; data: PullRequestsView }
  | { ok: false; error: AppError };

export interface PipelineTableRow {
  id: number;
  name: string;
  description: string | null;
  result: PipelineResult;
  status: PipelineStatus;
  project: string;
  startedAt: string | null;
  finishedAt: string | null;
  durationSeconds: number | null;
  url: string;
}

export interface PipelinesView {
  context: OverviewContext | null;
  items: PipelineTableRow[];
  truncated: boolean;
  fetchedAt: string | null;
  stale: boolean;
}

export interface PipelinesLoadInput {
  force?: boolean;
}

export type PipelinesLoadResult =
  | { ok: true; data: PipelinesView }
  | { ok: false; error: AppError };


export interface OverviewLoadInput {
  force?: boolean;
}

export type OverviewLoadResult =
  | { ok: true; data: OverviewView }
  | { ok: false; error: AppError };

export type OpenExternalResult = { ok: true } | { ok: false; error: AppError };

export interface WindowControls {
  minimize(): void;
  close(): void;
}

export interface SessionSelection {
  projectId?: string | null;
  teamId?: string | null;
}

export interface DiagnosticsExportResult {
  ok: true;
  path: string;
}

export interface IpcApi {
  config: {
    get(): Promise<ConfigView>;
    save(input: SaveConfigInput): Promise<SaveConfigResult>;
    remove(): Promise<{ ok: boolean; error?: AppError }>;
  };
  projects: {
    list(input?: { force?: boolean }): Promise<ListResult<Project>>;
    teams(input: { projectId: string; force?: boolean }): Promise<ListResult<Team>>;
  };
  overview: {
    load(input?: OverviewLoadInput): Promise<OverviewLoadResult>;
  };
  workItems: {
    load(input?: WorkItemsLoadInput): Promise<WorkItemsLoadResult>;
  };
  pullRequests: {
    load(input?: PullRequestsLoadInput): Promise<PullRequestsLoadResult>;
  };
  pipelines: {
    load(input?: PipelinesLoadInput): Promise<PipelinesLoadResult>;
  };
  session: {
    select(input: SessionSelection): Promise<{ ok: boolean; error?: AppError }>;
  };
  diagnostics: {
    export(): Promise<DiagnosticsExportResult>;
  };
  app: {
    version(): Promise<{ version: string }>;
    openExternal(input: { url: string }): Promise<OpenExternalResult>;
  };
  windowControls: {
    minimize(): Promise<{ ok: boolean; error?: AppError }>;
    close(): Promise<{ ok: boolean; error?: AppError }>;
  };
}
