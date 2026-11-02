import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AppErrorException, ErrorCode } from '@shared/errors';
import type { CacheSnapshot } from '@shared/contracts';
import { EncryptedJsonStore, type CacheKeyProvider } from './encrypted-json-store';

export type { CacheKeyProvider };

export class CacheService {
  private readonly store: EncryptedJsonStore<CacheSnapshot>;

  constructor(
    dataDir: string,
    keyProvider: CacheKeyProvider,
  ) {
    this.store = new EncryptedJsonStore(join(dataDir, 'cache.json.enc'), keyProvider);
  }

  async read(): Promise<CacheSnapshot | null> {
    return this.store.read();
  }

  async write(snapshot: CacheSnapshot): Promise<void> {
    await this.store.write(snapshot);
  }

  async clear(): Promise<void> {
    await this.store.clear();
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
