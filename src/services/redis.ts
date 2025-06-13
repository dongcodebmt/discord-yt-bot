import Redis from 'ioredis';
import { REDIS_URL } from '@/constants/config';

export class RedisService {
  private redis: Redis | null | undefined;

  constructor() {
    this.redis = REDIS_URL ? new Redis(REDIS_URL) : null;
    // throw Error('No redis configuration');
  }

  public async getAsync(key: string): Promise<any> {
    if (!this.redis) return null;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  public async setAsync(key: string, obj: any, ttl: number): Promise<void> {
    if (!this.redis) return;
    await this.redis.set(key, JSON.stringify(obj), 'EX', ttl);
  }
}