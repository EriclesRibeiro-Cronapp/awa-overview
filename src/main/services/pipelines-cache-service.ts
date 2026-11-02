import { join } from 'node:path';
import type { PipelineTableRow } from '@shared/contracts';
import { EncryptedJsonStore, type CacheKeyProvider } from './encrypted-json-store';

export interface PipelinesSnapshot {
  schemaVersion: 1;
  contextKey: string;
  organization: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
  fetchedAt: string;
  ttlSeconds: number;
  items: PipelineTableRow[];
  truncated: boolean;
}

export class PipelinesCacheService {
  private readonly store: EncryptedJsonStore<PipelinesSnapshot>;

  constructor(dataDir: string, keyProvider: CacheKeyProvider) {
    this.store = new EncryptedJsonStore(
      join(dataDir, 'pipelines-cache.json.enc'),
      keyProvider,
    );
  }

  async read(): Promise<PipelinesSnapshot | null> {
    const snapshot = await this.store.read();
    return snapshot?.schemaVersion === 1 ? snapshot : null;
  }

  async write(snapshot: PipelinesSnapshot): Promise<void> {
    await this.store.write(snapshot);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  isFresh(snapshot: PipelinesSnapshot, now = Date.now()): boolean {
    const fetched = new Date(snapshot.fetchedAt).getTime();
    if (!Number.isFinite(fetched)) return false;
    return now - fetched < snapshot.ttlSeconds * 1000;
  }
}
