import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

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

export class EncryptedJsonStore<T> {
  constructor(
    private readonly filePath: string,
    private readonly keyProvider: CacheKeyProvider,
  ) {}

  async read(): Promise<T | null> {
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
      return JSON.parse(decrypted.toString('utf8')) as T;
    } catch {
      return null;
    }
  }

  async write(value: T): Promise<void> {
    const key = await this.keyProvider.getKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(JSON.stringify(value), 'utf8')),
      cipher.final(),
    ]);
    const payload: EncryptedPayload = {
      schemaVersion: 1,
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      data: encrypted.toString('base64'),
    };

    const directory = dirname(this.filePath);
    await mkdir(directory, { recursive: true });
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
}
