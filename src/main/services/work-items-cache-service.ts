import { join } from 'node:path';
import type { WorkItemTableRow } from '@shared/contracts';
import { EncryptedJsonStore, type CacheKeyProvider } from './encrypted-json-store';

export interface WorkItemsSnapshot {
  schemaVersion: 1;
  contextKey: string;
  organization: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
  fetchedAt: string;
  ttlSeconds: number;
  items: WorkItemTableRow[];
  truncated: boolean;
}

export class WorkItemsCacheService {
  private readonly store: EncryptedJsonStore<WorkItemsSnapshot>;

  constructor(dataDir: string, keyProvider: CacheKeyProvider) {
    this.store = new EncryptedJsonStore(join(dataDir, 'work-items-cache.json.enc'), keyProvider);
  }

  async read(): Promise<WorkItemsSnapshot | null> {
    const snapshot = await this.store.read();
    return snapshot?.schemaVersion === 1 ? snapshot : null;
  }

  async write(snapshot: WorkItemsSnapshot): Promise<void> {
    await this.store.write(snapshot);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  isFresh(snapshot: WorkItemsSnapshot, now = Date.now()): boolean {
    const fetched = new Date(snapshot.fetchedAt).getTime();
    if (!Number.isFinite(fetched)) return false;
    return now - fetched < snapshot.ttlSeconds * 1000;
  }
}
