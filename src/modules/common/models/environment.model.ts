import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { ObjectId } from "mongodb";

export enum EnvironmentType {
  GLOBAL = "GLOBAL",
  LOCAL = "LOCAL",
}

export class VariableDto {
  @IsBoolean()
  @IsNotEmpty()
  checked: boolean;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class WorkspaceDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export class Environment {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @Type(() => VariableDto)
  @ValidateNested({ each: true })
  @IsOptional()
  variables: VariableDto[];

  @IsEnum(EnvironmentType)
  @IsNotEmpty()
  type: EnvironmentType;

  @Type(() => WorkspaceDto)
  @IsOptional()
  workspace?: WorkspaceDto;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}

export class EnvironmentDto {
  @IsMongoId()
  @IsNotEmpty()
  id: ObjectId;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEnum(EnvironmentType)
  @IsNotEmpty()
  @IsOptional()
  type?: EnvironmentType;
}
