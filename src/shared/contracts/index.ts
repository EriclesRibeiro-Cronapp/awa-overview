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
  session: {
    select(input: SessionSelection): Promise<{ ok: boolean; error?: AppError }>;
  };
  diagnostics: {
    export(): Promise<DiagnosticsExportResult>;
  };
  app: {
    version(): Promise<{ version: string }>;
  };
}
