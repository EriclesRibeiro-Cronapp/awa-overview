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

export interface RemovalDependencies {
  config: RemovableConfig;
  credentials: RemovableCredentials;
  cache: RemovableCache;
  cacheKey: RemovableCacheKey;
}

export async function removeConfiguration(deps: RemovalDependencies): Promise<void> {
  await deps.credentials.clear();
  await deps.cache.clear();
  await deps.cacheKey.clear();
  await deps.config.reset();
}
