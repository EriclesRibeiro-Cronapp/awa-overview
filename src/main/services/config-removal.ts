export interface RemovableConfig {
  reset(): Promise<void>;
}

export interface RemovableCredentials {
  clear(): Promise<void>;
}

export interface RemovableCache {
  clear(): Promise<void>;
}

export interface RemovableCacheKey {
  clear(): Promise<void>;
}

export interface RemovableOverviewCache {
  clear(): Promise<void>;
}

export interface RemovableWorkItemsCache {
  clear(): Promise<void>;
}

export interface RemovablePullRequestsCache {
  clear(): Promise<void>;
}

export interface RemovablePipelinesCache {
  clear(): Promise<void>;
}

export interface RemovalDependencies {
  config: RemovableConfig;
  credentials: RemovableCredentials;
  cache: RemovableCache;
  cacheKey: RemovableCacheKey;
  overviewCache: RemovableOverviewCache;
  workItemsCache: RemovableWorkItemsCache;
  pullRequestsCache: RemovablePullRequestsCache;
  pipelinesCache: RemovablePipelinesCache;
}

export async function removeConfiguration(deps: RemovalDependencies): Promise<void> {
  await deps.credentials.clear();
  await deps.cache.clear();
  await deps.cacheKey.clear();
  await deps.overviewCache.clear();
  await deps.workItemsCache.clear();
  await deps.pullRequestsCache.clear();
  await deps.pipelinesCache.clear();
  await deps.config.reset();
}
