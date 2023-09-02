import { Global, Module } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
import { ContextService } from "./services/context.service";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";
@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: "DATABASE_CONNECTION",
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Db> => {
        try {
          const client = await MongoClient.connect(configService.get("db.url"));
          return client.db();
        } catch (e) {
          throw e;
        }
      },
    },
    {
      provide: Redis,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Redis({
          host: configService.get("redis.host"),
          port: configService.get("redis.port"),
          db: configService.get("redis.db"),
        }),
    },
    ContextService,
  ],
  exports: ["DATABASE_CONNECTION", Redis, ContextService],
})
export class CommonModule {}
