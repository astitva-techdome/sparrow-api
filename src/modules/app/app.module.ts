import { Module } from "@nestjs/common";
import { AppController } from "@app/app.controller";
import { AppService } from "@app/app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AccessControlModule } from "nest-access-control";
import { roles } from "@app/app.roles";
import { Env, EnvironmentVariables } from "@common/config/env.validation";
import { transformAndValidateSync } from "class-transformer-validator";
import configuration from "@common/config/configuration";
import { WorkspaceModule } from "../workspace/workspace.module";
import { CommonModule } from "../common/common.module";
import { IdentityModule } from "../identity/identity.module";
import { LoggerModule } from "nestjs-pino";
import pino from "pino";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          pinoHttp: {
            level:
              configService.get("app.env") === Env.DEV
                ? pino.levels.labels["30"]
                : pino.levels.labels["50"],
            stream: pino.multistream([
              { stream: process.stdout },
              {
                stream: pino.destination({
                  dest:
                    configService.get("app.env") === Env.DEV
                      ? "./logs/info.log"
                      : "./logs/error.log",
                  sync: true,
                  append: true,
                  mkdir: true,
                }),
              },
            ]),
          },
        };
      },
    }),
    AccessControlModule.forRoles(roles),
    ConfigModule,
    IdentityModule,
    WorkspaceModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: EnvironmentVariables,
      useValue: transformAndValidateSync(EnvironmentVariables, process.env),
    },
  ],
})
export class AppModule {}
