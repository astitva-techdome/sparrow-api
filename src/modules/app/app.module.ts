import * as winston from "winston";
import { Module } from "@nestjs/common";
import { AppController } from "@app/app.controller";
import { AppService } from "@app/app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "@auth/auth.module";
import { WinstonModule } from "@winston/winston.module";
import { AccessControlModule } from "nest-access-control";
import { roles } from "@app/app.roles";
import { Env, EnvironmentVariables } from "@common/config/env.validation";
import { transformAndValidateSync } from "class-transformer-validator";
import configuration from "@common/config/configuration";
import { WorkspaceModule } from "../workspace/workspace.module";
import { UserModule } from "../user/user.module";
import { CommonModule } from "../common/common.module";
import { TeamModule } from "../team/team.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get("env") === Env.DEV
          ? {
              level: "info",
              format: winston.format.json(),
              defaultMeta: { service: "user-service" },
              transports: [
                new winston.transports.Console({
                  format: winston.format.simple(),
                }),
              ],
            }
          : {
              level: "info",
              format: winston.format.json(),
              defaultMeta: { service: "user-service" },
              transports: [
                new winston.transports.File({
                  filename: "logs/error.log",
                  level: "error",
                }),
                new winston.transports.Console({
                  format: winston.format.simple(),
                }),
              ],
            };
      },
    }),
    AccessControlModule.forRoles(roles),
    ConfigModule,
    AuthModule,
    UserModule,
    WorkspaceModule,
    CommonModule,
    TeamModule,
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
