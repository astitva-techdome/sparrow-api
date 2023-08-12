import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumberString, IsString } from "class-validator";

export enum Env {
  DEV = "DEV",
  PROD = "PROD",
}

export class EnvironmentVariables {
  @Type(() => Number)
  @IsNumberString()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Env)
  APP_ENV: number;

  @IsString()
  @IsNotEmpty()
  APP_URL: number;

  @IsString()
  @IsNotEmpty()
  WEBTOKEN_SECRET_KEY: number;

  @Type(() => Number)
  @IsNumberString()
  WEBTOKEN_EXPIRATION_TIME: number;

  @IsString()
  @IsNotEmpty()
  DB_URL: number;
}
