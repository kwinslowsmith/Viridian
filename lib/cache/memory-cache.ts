// In-memory cache implementation for testing/development when Redis is unavailable
interface CacheEntry {
  value: any;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

export async function getFromMemoryCache(key: string) {
  const entry = memoryCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

export async function setInMemoryCache(key: string, value: any, ttlSeconds: number = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { value, expiresAt });
}

export async function invalidateMemoryCachePattern(pattern: string) {
  const regex = new RegExp(pattern.replace('*', '.*'));
  const keysToDelete: string[] = [];

  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => memoryCache.delete(key));
}

export function getMemoryCacheStats() {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}
