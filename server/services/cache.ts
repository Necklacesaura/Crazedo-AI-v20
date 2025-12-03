/**
 * Simple in-memory cache with TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get cached data if still valid
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > entry.ttl;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  console.log(`✅ Using cached data for: ${key}`);
  return entry.data as T;
}

/**
 * Set cache with TTL in milliseconds
 */
export function setCached<T>(key: string, data: T, ttl: number = 15 * 60 * 1000): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
  console.log(`💾 Cached data for: ${key} (${ttl / 1000 / 60} min TTL)`);
}
