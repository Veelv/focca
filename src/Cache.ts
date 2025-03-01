import Redis from 'ioredis';
import { ICache } from './interfaces/ICache';

export class Cache implements ICache {
  public static globalCache: Map<string, any> = new Map();
  public static redisClient: Redis | null = null;

  static init(redisConfig?: { host: string; port: number; password?: string }): void {
    if (redisConfig) {
      this.redisClient = new Redis(redisConfig);
    }
  }

  async get(key: string): Promise<any | null> {
    if (Cache.redisClient) {
      const cachedValue = await Cache.redisClient.get(key);
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    }
    return Cache.globalCache.get(key) || null;
  }

  async set(key: string, value: any, expirationInSeconds?: number): Promise<void> {
    if (Cache.redisClient) {
      await Cache.redisClient.set(key, JSON.stringify(value), 'EX', expirationInSeconds || 3600);
    }
    Cache.globalCache.set(key, value);
  }

  clear(): void {
    Cache.globalCache.clear();
    if (Cache.redisClient) {
      Cache.redisClient.flushall();
    }
  }
}