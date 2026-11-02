import { ipcMain } from 'electron';
import { z } from 'zod';
import type { ConfigView, IpcApi, SessionSelection } from '@shared/contracts';
import { AppErrorException, ErrorCode, toAppError } from '@shared/errors';
import type { AzureDevOpsClient } from '../services/azure-devops-client';
import type { CacheKeyProvider, CacheService } from '../services/cache-service';
import type { ConfigService } from '../services/config-service';
import { normalizeOrganization } from '../services/config-service';
import type { CredentialsService } from '../services/credentials-service';
import type { DiagnosticsService } from '../services/diagnostics-service';
import { logError, logEvent } from '../services/logger';
import type { ProjectsService } from '../services/projects-service';

export interface IpcDependencies {
  config: ConfigService;
  credentials: CredentialsService;
  cache: CacheService;
  cacheKey: CacheKeyProvider;
  client: AzureDevOpsClient;
  projects: ProjectsService;
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
      const input = SaveConfigSchema.parse(raw);
      const organization = normalizeOrganization(input.organization);
      const pat = input.pat.trim();
      if (!pat) throw new AppErrorException(ErrorCode.CONFIG_PAT_MISSING);

      const user = await deps.client.validate(organization, pat);
      const { patLast4 } = await deps.credentials.save(pat);
      await deps.config.setOrganization(organization, 'configured');
      logEvent('config.saved', { organization });
      return { ok: true, patLast4, ...(user.displayName ? { user } : {}) };
    }, 'config:save');
  });

  ipcMain.handle('config:remove', async () => {
    return runSafely(async () => {
      await deps.credentials.clear();
      await deps.cache.clear();
      await deps.cacheKey.clear();
      await deps.config.reset();
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

async function runSafely<T>(
  action: () => Promise<T>,
  operation: string,
): Promise<T | { ok: false; error: ReturnType<typeof toAppError> }> {
  try {
    return await action();
  } catch (error) {
    const appError = toAppError(error);
    logError(appError.code, appError.message, { operation });
    return { ok: false, error: appError };
  }
}

export type IpcSurface = IpcApi;
