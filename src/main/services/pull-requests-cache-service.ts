import { join } from 'node:path';
import type { PullRequestTableRow } from '@shared/contracts';
import { EncryptedJsonStore, type CacheKeyProvider } from './encrypted-json-store';

export interface PullRequestsSnapshot {
  schemaVersion: 1;
  contextKey: string;
  organization: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
  fetchedAt: string;
  ttlSeconds: number;
  items: PullRequestTableRow[];
  truncated: boolean;
}

export class PullRequestsCacheService {
  private readonly store: EncryptedJsonStore<PullRequestsSnapshot>;

  constructor(dataDir: string, keyProvider: CacheKeyProvider) {
    this.store = new EncryptedJsonStore(
      join(dataDir, 'pull-requests-cache.json.enc'),
      keyProvider,
    );
  }

  async read(): Promise<PullRequestsSnapshot | null> {
    const snapshot = await this.store.read();
    return snapshot?.schemaVersion === 1 ? snapshot : null;
  }

  async write(snapshot: PullRequestsSnapshot): Promise<void> {
    await this.store.write(snapshot);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  isFresh(snapshot: PullRequestsSnapshot, now = Date.now()): boolean {
    const fetched = new Date(snapshot.fetchedAt).getTime();
    if (!Number.isFinite(fetched)) return false;
    return now - fetched < snapshot.ttlSeconds * 1000;
  }
}
