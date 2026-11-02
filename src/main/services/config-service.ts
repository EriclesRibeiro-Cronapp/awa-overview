import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { ConfigStatus, SessionSelection } from '@shared/contracts';

const ConfigSchema = z.object({
  schemaVersion: z.number().int().positive().default(1),
  organization: z.string().nullable().default(null),
  normalizedOrganization: z.string().nullable().default(null),
  status: z.enum(['unconfigured', 'configured', 'invalid']).default('unconfigured'),
  lastValidatedAt: z.string().nullable().default(null),
  selectedProjectId: z.string().nullable().default(null),
  selectedTeamId: z.string().nullable().default(null),
});

export type StoredConfig = z.infer<typeof ConfigSchema>;

const DEFAULT_CONFIG: StoredConfig = {
  schemaVersion: 1,
  organization: null,
  normalizedOrganization: null,
  status: 'unconfigured',
  lastValidatedAt: null,
  selectedProjectId: null,
  selectedTeamId: null,
};

const ORGANIZATION_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function normalizeOrganization(input: string): string {
  const value = input.trim().toLowerCase();
  if (!value) throw new AppErrorException(ErrorCode.CONFIG_ORG_MISSING);
  if (!ORGANIZATION_PATTERN.test(value)) throw new AppErrorException(ErrorCode.CONFIG_ORG_MISSING);
  return value;
}

export class ConfigService {
  private readonly filePath: string;
  private cache: StoredConfig | null = null;

  constructor(private readonly dataDir: string) {
    this.filePath = join(dataDir, 'config.json');
  }

  async get(): Promise<StoredConfig> {
    if (this.cache) return this.cache;
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const parsed = ConfigSchema.safeParse(JSON.parse(raw));
      this.cache = parsed.success ? parsed.data : { ...DEFAULT_CONFIG };
    } catch {
      this.cache = { ...DEFAULT_CONFIG };
    }
    return this.cache;
  }

  async setOrganization(organization: string, status: ConfigStatus = 'configured'): Promise<void> {
    const normalized = normalizeOrganization(organization);
    const current = await this.get();
    await this.save({
      ...current,
      organization: organization.trim(),
      normalizedOrganization: normalized,
      status,
      lastValidatedAt: status === 'configured' ? new Date().toISOString() : current.lastValidatedAt,
    });
  }

  async setStatus(status: ConfigStatus): Promise<void> {
    const current = await this.get();
    await this.save({
      ...current,
      status,
      lastValidatedAt: status === 'configured' ? new Date().toISOString() : current.lastValidatedAt,
    });
  }

  async setSelection(selection: SessionSelection): Promise<void> {
    const current = await this.get();
    await this.save({
      ...current,
      selectedProjectId:
        selection.projectId !== undefined ? selection.projectId : current.selectedProjectId,
      selectedTeamId: selection.teamId !== undefined ? selection.teamId : current.selectedTeamId,
    });
  }

  async reset(): Promise<void> {
    await this.save({ ...DEFAULT_CONFIG });
    await rm(this.filePath, { force: true }).catch(() => undefined);
    this.cache = { ...DEFAULT_CONFIG };
  }

  private async save(config: StoredConfig): Promise<void> {
    const validated = ConfigSchema.parse(config);
    await mkdir(this.dataDir, { recursive: true });
    const temp = `${this.filePath}.tmp`;
    await writeFile(temp, `${JSON.stringify(validated, null, 2)}\n`, 'utf8');
    try {
      await rename(temp, this.filePath);
    } catch {
      await rm(this.filePath, { force: true });
      await rename(temp, this.filePath);
    }
    this.cache = validated;
  }
}
