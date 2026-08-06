import { createClient } from 'redis';
import { getFromMemoryCache, setInMemoryCache, invalidateMemoryCachePattern } from './memory-cache';

let redis: ReturnType<typeof createClient> | null = null;
let useRedis = true;

async function initializeRedis() {
  if (useRedis && !redis) {
    try {
      redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      redis.on('error', (err) => {
        console.warn('Redis unavailable, falling back to in-memory cache');
        useRedis = false;
      });

      await redis.connect();
      console.log('Connected to Redis');
      return true;
    } catch (error) {
      console.warn('Redis connection failed, using in-memory cache:', error);
      useRedis = false;
      return false;
    }
  }
  return useRedis;
}

export async function getMagazineFromCache(cacheKey: string) {
  try {
    const redisAvailable = await initializeRedis();

    if (redisAvailable && redis) {
      const cached = await redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } else {
      return await getFromMemoryCache(cacheKey);
    }
  } catch (error) {
    console.warn('Cache miss or error retrieving from cache:', error);
    return await getFromMemoryCache(cacheKey);
  }
}

export async function setMagazineCache(
  cacheKey: string,
  data: any,
  ttl: number = 300
) {
  try {
    const redisAvailable = await initializeRedis();

    if (redisAvailable && redis) {
      await redis.setEx(cacheKey, ttl, JSON.stringify(data));
    } else {
      await setInMemoryCache(cacheKey, data, ttl);
    }
  } catch (error) {
    console.warn('Cache set failed, using in-memory cache:', error);
    await setInMemoryCache(cacheKey, data, ttl);
  }
}

export async function invalidateMagazineCache() {
  try {
    const redisAvailable = await initializeRedis();

    if (redisAvailable && redis) {
      const pattern = 'magazine:*';
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } else {
      await invalidateMemoryCachePattern('magazine:.*');
    }
  } catch (error) {
    console.warn('Cache invalidation failed:', error);
    await invalidateMemoryCachePattern('magazine:.*');
  }
}

export async function closeCacheConnection() {
  if (redis && redis.isOpen) {
    await redis.quit();
    redis = null;
  }
}
