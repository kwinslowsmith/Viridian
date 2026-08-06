import { createClient } from 'redis';

let redis: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redis.on('error', (err) => console.error('Redis error:', err));
  }

  return redis;
}

export async function getMagazineFromCache(cacheKey: string) {
  try {
    const client = await getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    const cached = await client.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Cache miss or error retrieving from cache:', error);
    return null;
  }
}

export async function setMagazineCache(
  cacheKey: string,
  data: any,
  ttl: number = 300
) {
  try {
    const client = await getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    await client.setEx(cacheKey, ttl, JSON.stringify(data));
  } catch (error) {
    console.warn('Cache set failed, continuing without cache:', error);
  }
}

export async function invalidateMagazineCache() {
  try {
    const client = await getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    const pattern = 'magazine:*';
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.warn('Cache invalidation failed:', error);
  }
}

export async function closeCacheConnection() {
  if (redis && redis.isOpen) {
    await redis.quit();
    redis = null;
  }
}
