import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export enum Env {
  DEV = "DEV",
  PROD = "PROD",
}

export class EnvironmentVariables {
  @Type(() => Number)
  @IsNumber()
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
  @IsNumber()
  WEBTOKEN_EXPIRATION_TIME: number;

  @IsString()
  @IsNotEmpty()
  DB_URL: number;

  @IsString()
  @IsNotEmpty()
  REFRESHTOKEN_SECRET_KEY: string;

  @Type(() => Number)
  @IsNumber()
  REFRESHTOKEN_EXPIRATION_TIME: number;
}
