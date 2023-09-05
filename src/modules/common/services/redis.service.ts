import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class RedisService {
  constructor(
    private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  async addValueInRedis(id: string) {
    await this.redis.set(
      this.configService.get("app.userBlacklistPrefix") + id,
      id,
    );
  }
}
