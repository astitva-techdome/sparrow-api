import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
@Injectable()
export class RedisService {
  constructor(private readonly redis: Redis) {}

  async set(key: string, value?: string, ttl?: number) {
    if (ttl) {
      await this.redis.set(key, value, "EX", ttl);
    } else {
      await this.redis.set(key, value);
    }
    return;
  }
}
