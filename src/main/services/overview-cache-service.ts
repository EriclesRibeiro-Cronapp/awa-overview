import { join } from 'node:path';
import type {
  PipelineRunSummary,
  PullRequestSummary,
  WorkItemSummary,
} from '@shared/contracts';
import { EncryptedJsonStore, type CacheKeyProvider } from './encrypted-json-store';

export interface OverviewSnapshot {
  schemaVersion: 1;
  contextKey: string;
  organization: string;
  projectId: string;
  projectName: string;
  teamId: string | null;
  teamName: string | null;
  fetchedAt: string;
  ttlSeconds: number;
  workItems: WorkItemSummary[];
  pullRequest: PullRequestSummary | null;
  pipeline: PipelineRunSummary | null;
}

export class OverviewCacheService {
  private readonly store: EncryptedJsonStore<OverviewSnapshot>;

  constructor(dataDir: string, keyProvider: CacheKeyProvider) {
    this.store = new EncryptedJsonStore(join(dataDir, 'overview-cache.json.enc'), keyProvider);
  }

  async read(): Promise<OverviewSnapshot | null> {
    const snapshot = await this.store.read();
    return snapshot?.schemaVersion === 1 ? snapshot : null;
  }

  async write(snapshot: OverviewSnapshot): Promise<void> {
    await this.store.write(snapshot);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  isFresh(snapshot: OverviewSnapshot, now = Date.now()): boolean {
    const fetched = new Date(snapshot.fetchedAt).getTime();
    if (!Number.isFinite(fetched)) return false;
    return now - fetched < snapshot.ttlSeconds * 1000;
  }
}
