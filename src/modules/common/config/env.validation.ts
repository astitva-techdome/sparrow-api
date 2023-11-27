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
  DB_URL: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_APP_URL: string;

  @IsString()
  @IsNotEmpty()
  REFRESHTOKEN_SECRET_KEY: string;

  @Type(() => Number)
  @IsNumber()
  REFRESHTOKEN_EXPIRATION_TIME: number;

  @Type(() => Number)
  @IsNumber()
  REFRESHTOKEN_MAX_SIZE: number;

  @IsString()
  SENDEREMAIL: string;

  @IsString()
  SENDERPASSWORD: string;

  @IsString()
  LOGIN_REDIRECT_URL: string;
  @IsNotEmpty()
  AZURE_CONNECTION_STRING: string;
  @IsString()
  @IsNotEmpty()
  GOOGLE_ACCESS_TYPE: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  VALIDATION_CODE_EXPIRATION_TIME: number;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKERS: string;
}
