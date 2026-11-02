import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { CacheSnapshot } from '@shared/contracts';

export interface CacheKeyProvider {
  getKey(): Promise<Buffer>;
  clear(): Promise<void>;
}

interface EncryptedPayload {
  schemaVersion: 1;
  iv: string;
  tag: string;
  data: string;
}

export class CacheService {
  private readonly filePath: string;

  constructor(
    private readonly dataDir: string,
    private readonly keyProvider: CacheKeyProvider,
  ) {
    this.filePath = join(dataDir, 'cache.json.enc');
  }

  async read(): Promise<CacheSnapshot | null> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, 'utf8');
    } catch {
      return null;
    }

    try {
      const payload = JSON.parse(raw) as EncryptedPayload;
      if (payload.schemaVersion !== 1) return null;
      const key = await this.keyProvider.getKey();
      const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
      decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(payload.data, 'base64')),
        decipher.final(),
      ]);
      return JSON.parse(decrypted.toString('utf8')) as CacheSnapshot;
    } catch {
      return null;
    }
  }

  async write(snapshot: CacheSnapshot): Promise<void> {
    const key = await this.keyProvider.getKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(JSON.stringify(snapshot), 'utf8')),
      cipher.final(),
    ]);
    const payload: EncryptedPayload = {
      schemaVersion: 1,
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      data: encrypted.toString('base64'),
    };

    await mkdir(this.dataDir, { recursive: true });
    const temp = `${this.filePath}.tmp`;
    await writeFile(temp, `${JSON.stringify(payload)}\n`, 'utf8');
    try {
      await rename(temp, this.filePath);
    } catch {
      await rm(this.filePath, { force: true });
      await rename(temp, this.filePath);
    }
  }

  async clear(): Promise<void> {
    await rm(this.filePath, { force: true }).catch(() => undefined);
  }

  isFresh(snapshot: CacheSnapshot, now = Date.now()): boolean {
    const fetched = new Date(snapshot.fetchedAt).getTime();
    if (!Number.isFinite(fetched)) return false;
    return now - fetched < snapshot.ttlSeconds * 1000;
  }
}

export class FileCacheKeyProvider implements CacheKeyProvider {
  private readonly keyPath: string;

  constructor(
    private readonly dataDir: string,
    private readonly storage: {
      isAvailable(): boolean;
      encryptString(value: string): Buffer;
      decryptString(value: Buffer): string;
    },
  ) {
    this.keyPath = join(dataDir, 'cache.key');
  }

  async getKey(): Promise<Buffer> {
    try {
      const encrypted = await readFile(this.keyPath);
      return Buffer.from(this.storage.decryptString(encrypted), 'base64');
    } catch {
      if (!this.storage.isAvailable()) {
        throw new AppErrorException(
          ErrorCode.CONFIG_UNEXPECTED,
          'O cofre seguro não está disponível para proteger o cache.',
        );
      }
      const key = randomBytes(32);
      const encrypted = this.storage.encryptString(key.toString('base64'));
      await mkdir(this.dataDir, { recursive: true });
      await writeFile(this.keyPath, encrypted);
      return key;
    }
  }

  async clear(): Promise<void> {
    await rm(this.keyPath, { force: true }).catch(() => undefined);
  }
}
