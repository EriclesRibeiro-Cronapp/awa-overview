import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { AppErrorException, ErrorCode } from '@shared/errors';

export interface SecureStorageAdapter {
  isAvailable(): boolean;
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
}

const CredentialSchema = z.object({
  schemaVersion: z.number().int().positive().default(1),
  encrypted: z.string().min(1),
  last4: z.string().length(4),
  updatedAt: z.string(),
});

type StoredCredential = z.infer<typeof CredentialSchema>;

export class CredentialsService {
  private readonly filePath: string;

  constructor(
    private readonly dataDir: string,
    private readonly storage: SecureStorageAdapter,
  ) {
    this.filePath = join(dataDir, 'credentials.json');
  }

  async save(pat: string): Promise<{ patLast4: string }> {
    const value = pat.trim();
    if (!value) throw new AppErrorException(ErrorCode.CONFIG_PAT_MISSING);
    if (!this.storage.isAvailable()) {
      throw new AppErrorException(
        ErrorCode.CONFIG_UNEXPECTED,
        'O cofre seguro do sistema operacional não está disponível.',
      );
    }

    const encrypted = this.storage.encryptString(value);
    const record: StoredCredential = {
      schemaVersion: 1,
      encrypted: encrypted.toString('base64'),
      last4: value.slice(-4),
      updatedAt: new Date().toISOString(),
    };

    await mkdir(this.dataDir, { recursive: true });
    const temp = `${this.filePath}.tmp`;
    await writeFile(temp, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
    try {
      await rename(temp, this.filePath);
    } catch {
      await rm(this.filePath, { force: true });
      await rename(temp, this.filePath);
    }

    return { patLast4: record.last4 };
  }

  async readPat(): Promise<string> {
    const record = await this.readRecord();
    if (!record) throw new AppErrorException(ErrorCode.CONFIG_PAT_MISSING);
    try {
      return this.storage.decryptString(Buffer.from(record.encrypted, 'base64'));
    } catch {
      throw new AppErrorException(ErrorCode.CONFIG_PAT_INVALID);
    }
  }

  async has(): Promise<boolean> {
    return (await this.readRecord()) !== null;
  }

  async getLast4(): Promise<string | null> {
    return (await this.readRecord())?.last4 ?? null;
  }

  async clear(): Promise<void> {
    await rm(this.filePath, { force: true }).catch(() => undefined);
  }

  private async readRecord(): Promise<StoredCredential | null> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const parsed = CredentialSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }
}
