import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
@Injectable()
export class RedisService {
  constructor(private readonly redis: Redis) {}

  async set(key: string, value?: string) {
    await this.redis.set(key, value ?? 1);
  }
}
