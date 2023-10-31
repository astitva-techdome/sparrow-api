import { Global, Module } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
import { ContextService } from "./services/context.service";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "./services/redis.service";
import { AzureBusService } from "./services/azureBus/azure-bus.service";
import { WorkspaceModule } from "../workspace/workspace.module";
import { ApiResponseService } from "./services/api-response.service";
import { ParserService } from "./services/parser.service";

@Global()
@Module({
  imports: [WorkspaceModule],
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
    AzureBusService,
    ContextService,
    RedisService,
    ApiResponseService,
    ParserService,
  ],
  exports: [
    "DATABASE_CONNECTION",
    Redis,
    ContextService,
    RedisService,
    AzureBusService,
    ApiResponseService,
    ParserService,
  ],
})
export class CommonModule {}
