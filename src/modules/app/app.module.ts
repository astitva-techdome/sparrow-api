import { Module } from "@nestjs/common";
import { AppController } from "@app/app.controller";
import { AppService } from "@app/app.service";
import { ConfigModule } from "@nestjs/config";
import { AccessControlModule } from "nest-access-control";
import { roles } from "@app/app.roles";
import { EnvironmentVariables } from "@common/config/env.validation";
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
    LoggerModule.forRoot({
      pinoHttp: {
        stream: pino.destination({
          dest: "./logs/error.log",
          minLength: 4096,
          sync: true,
        }),
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
