import { ipcMain, shell } from 'electron';
import { z } from 'zod';
import type {
  ConfigView,
  IpcApi,
  SessionSelection,
} from '@shared/contracts';
import { AppErrorException, ErrorCode, toAppError } from '@shared/errors';
import type { AzureDevOpsClient } from '../services/azure-devops-client';
import type { CacheKeyProvider, CacheService } from '../services/cache-service';
import type { ConfigService } from '../services/config-service';
import { normalizeOrganization } from '../services/config-service';
import { removeConfiguration } from '../services/config-removal';
import type { CredentialsService } from '../services/credentials-service';
import type { DiagnosticsService } from '../services/diagnostics-service';
import { logError, logEvent } from '../services/logger';
import type { OverviewCacheService } from '../services/overview-cache-service';
import { emptyOverviewView, type OverviewService } from '../services/overview-service';
import type { ProjectsService } from '../services/projects-service';
import type { WorkItemsCacheService } from '../services/work-items-cache-service';
import { emptyWorkItemsView, type WorkItemsService } from '../services/work-items-service';

export interface IpcDependencies {
  config: ConfigService;
  credentials: CredentialsService;
  cache: CacheService;
  cacheKey: CacheKeyProvider;
  overviewCache: OverviewCacheService;
  workItemsCache: WorkItemsCacheService;
  client: AzureDevOpsClient;
  projects: ProjectsService;
  overview: OverviewService;
  workItems: WorkItemsService;
  diagnostics: DiagnosticsService;
  appVersion: string;
}

const SaveConfigSchema = z.object({
  organization: z.string().min(1),
  pat: z.string().min(1),
});

const SelectionSchema = z.object({
  projectId: z.string().min(1).nullable().optional(),
  teamId: z.string().min(1).nullable().optional(),
});

const ProjectIdSchema = z.object({
  projectId: z.string().min(1),
  force: z.boolean().optional(),
});

const OverviewLoadSchema = z
  .object({
    force: z.boolean().optional(),
  })
  .optional();

const WorkItemsLoadSchema = z
  .object({
    force: z.boolean().optional(),
  })
  .optional();

const OpenExternalSchema = z.object({
  url: z.string().url(),
});

export function registerIpcHandlers(deps: IpcDependencies): void {
  ipcMain.handle('config:get', async (): Promise<ConfigView> => {
    try {
      return await buildConfigView(deps);
    } catch (error) {
      logError('config:get', 'Falha ao ler a configuração', { error: String(error) });
      return {
        organization: null,
        status: 'unconfigured',
        hasPat: false,
        patLast4: null,
        selectedProjectId: null,
        selectedTeamId: null,
        lastValidatedAt: null,
      };
    }
  });

  ipcMain.handle('config:save', async (_event, raw: unknown) => {
    return runSafely(async () => {
      const parsed = SaveConfigSchema.safeParse(raw);
      if (!parsed.success) {
        const field = parsed.error.issues[0]?.path[0];
        throw new AppErrorException(
          field === 'pat' ? ErrorCode.CONFIG_PAT_MISSING : ErrorCode.CONFIG_ORG_MISSING,
        );
      }

      const organization = normalizeOrganization(parsed.data.organization);
      const pat = parsed.data.pat.trim();
      if (!pat) throw new AppErrorException(ErrorCode.CONFIG_PAT_MISSING);

      const user = await deps.client.validateAccess(organization, pat);
      const previous = await deps.config.get();
      const { patLast4 } = await deps.credentials.save(pat);

      if (previous.normalizedOrganization && previous.normalizedOrganization !== organization) {
        await deps.cache.clear();
        await deps.cacheKey.clear();
        await deps.overviewCache.clear();
        await deps.workItemsCache.clear();
        logEvent('config.organizationChanged', {
          from: previous.normalizedOrganization,
          to: organization,
        });
      }

      await deps.config.setOrganization(organization, 'configured');
      logEvent('config.saved', { organization });
      return { ok: true, patLast4, ...(user.displayName ? { user } : {}) };
    }, 'config:save');
  });

  ipcMain.handle('config:remove', async () => {
    return runSafely(async () => {
      await removeConfiguration(deps);
      logEvent('config.removed');
      return { ok: true };
    }, 'config:remove');
  });

  ipcMain.handle('projects:list', async (_event, raw?: unknown) => {
    return runSafely(async () => {
      const force = z.object({ force: z.boolean().optional() }).optional().parse(raw)?.force ?? false;
      const { organization, pat } = await requireConnection(deps);
      const result = await deps.projects.listProjects(organization, pat, force);
      return { ok: true, items: result.items, stale: result.stale, fetchedAt: result.fetchedAt };
    }, 'projects:list');
  });

  ipcMain.handle('teams:list', async (_event, raw: unknown) => {
    return runSafely(async () => {
      const input = ProjectIdSchema.parse(raw);
      const { organization, pat } = await requireConnection(deps);
      const result = await deps.projects.listTeams(organization, pat, input.projectId, input.force);
      return { ok: true, items: result.items, stale: result.stale, fetchedAt: result.fetchedAt };
    }, 'teams:list');
  });

  ipcMain.handle('overview:load', async (_event, raw?: unknown) => {
    return runSafely(async () => {
      const input = OverviewLoadSchema.parse(raw);
      const current = await deps.config.get();
      const context = await resolveProjectContext(deps, current);
      if (!context) return { ok: true, data: emptyOverviewView() };

      const data = await deps.overview.load({
        ...context,
        force: input?.force ?? false,
      });
      return { ok: true, data };
    }, 'overview:load');
  });

  ipcMain.handle('workItems:load', async (_event, raw?: unknown) => {
    return runSafely(async () => {
      const input = WorkItemsLoadSchema.parse(raw);
      const current = await deps.config.get();
      const context = await resolveProjectContext(deps, current);
      if (!context) return { ok: true, data: emptyWorkItemsView() };

      const data = await deps.workItems.load({
        ...context,
        force: input?.force ?? false,
      });
      return { ok: true, data };
    }, 'workItems:load');
  });

  ipcMain.handle('app:openExternal', async (_event, raw: unknown) => {
    return runSafely(async () => {
      const input = OpenExternalSchema.parse(raw);
      if (!isAllowedExternalUrl(input.url)) {
        throw new AppErrorException(
          ErrorCode.CONFIG_UNEXPECTED,
          'Somente links do Azure DevOps podem ser abertos.',
        );
      }
      await shell.openExternal(input.url);
      return { ok: true as const };
    }, 'app:openExternal');
  });

  ipcMain.handle('session:select', async (_event, raw: unknown) => {
    return runSafely(async () => {
      const selection = SelectionSchema.parse(raw) as SessionSelection;
      await deps.config.setSelection(selection);
      return { ok: true };
    }, 'session:select');
  });

  ipcMain.handle('diagnostics:export', async () => {
    return runSafely(async () => {
      const path = await deps.diagnostics.export();
      logEvent('diagnostics.exported');
      return { ok: true, path };
    }, 'diagnostics:export');
  });

  ipcMain.handle('app:version', async () => ({ version: deps.appVersion }));
}

async function buildConfigView(deps: IpcDependencies): Promise<ConfigView> {
  const config = await deps.config.get();
  const patLast4 = await deps.credentials.getLast4();
  return {
    organization: config.organization,
    status: config.status,
    hasPat: patLast4 !== null,
    patLast4,
    selectedProjectId: config.selectedProjectId,
    selectedTeamId: config.selectedTeamId,
    lastValidatedAt: config.lastValidatedAt,
  };
}

async function requireConnection(deps: IpcDependencies): Promise<{ organization: string; pat: string }> {
  const config = await deps.config.get();
  if (!config.normalizedOrganization) throw new AppErrorException(ErrorCode.CONFIG_ORG_MISSING);
  const pat = await deps.credentials.readPat();
  return { organization: config.normalizedOrganization, pat };
}

interface ResolvedProjectContext {
  organization: string;
  pat: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
}

async function resolveProjectContext(
  deps: IpcDependencies,
  current: Awaited<ReturnType<IpcDependencies['config']['get']>>,
): Promise<ResolvedProjectContext | null> {
  if (!current.normalizedOrganization) {
    throw new AppErrorException(ErrorCode.CONFIG_ORG_MISSING);
  }
  if (!current.selectedProjectId) return null;

  const pat = await deps.credentials.readPat();
  const organization = current.normalizedOrganization;
  const projectId = current.selectedProjectId;

  const projects = await deps.projects.listProjects(organization, pat).catch(() => null);
  const projectName =
    projects?.items.find((project) => project.id === projectId)?.name ?? projectId;

  let teamName: string | null = null;
  if (current.selectedTeamId) {
    const teams = await deps.projects
      .listTeams(organization, pat, projectId)
      .catch(() => null);
    teamName = teams?.items.find((team) => team.id === current.selectedTeamId)?.name ?? null;
  }

  return {
    organization,
    pat,
    projectId,
    projectName,
    teamId: current.selectedTeamId,
    teamName,
  };
}

async function runSafely<T>(
  action: () => Promise<T>,
  operation: string,
): Promise<T | { ok: false; error: ReturnType<typeof toAppError> }> {
  try {
    return await action();
  } catch (error) {
    const appError = toAppError(error);
    const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
    logError(appError.code, appError.message, {
      operation,
      detail,
      ...(appError.details ? { details: appError.details } : {}),
    });
    return { ok: false, error: appError };
  }
}

function isAllowedExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    return url.hostname === 'dev.azure.com' || url.hostname.endsWith('.visualstudio.com');
  } catch {
    return false;
  }
}

export type IpcSurface = IpcApi;
