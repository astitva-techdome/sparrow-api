import * as winston from "winston";
import * as rotateFile from "winston-daily-rotate-file";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { ProfileModule } from "../profile/profile.module";
import { WinstonModule } from "../winston/winston.module";
import { AccessControlModule } from "nest-access-control";
import { roles } from "./app.roles";
import {
  Env,
  EnvironmentVariables,
} from "modules/common/config/env.validation";
import { transformAndValidateSync } from "class-transformer-validator";
import configuration from "modules/common/config/configuration";

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
                new rotateFile({
                  filename: "logs/application-%DATE%.log",
                  datePattern: "YYYY-MM-DD",
                  zippedArchive: true,
                  maxSize: "20m",
                  maxFiles: "14d",
                }),
              ],
            };
      },
    }),
    AccessControlModule.forRoles(roles),
    ConfigModule,
    AuthModule,
    ProfileModule,
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
