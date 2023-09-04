import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CollectionDto } from "./collection.model";
import { ObjectId } from "mongodb";

export enum WorkspaceType {
  PERSONAL = "PERSONAL",
  TEAM = "TEAM",
}

export class OwnerInformationDto {
  @IsMongoId()
  @IsNotEmpty()
  id: ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(WorkspaceType)
  @IsNotEmpty()
  type: WorkspaceType;
}

export class Workspace {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => OwnerInformationDto)
  @IsNotEmpty()
  owner: OwnerInformationDto;

  @IsArray()
  @Type(() => CollectionDto)
  @ValidateNested({ each: true })
  @IsOptional()
  collection?: CollectionDto;

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

export class WorkspaceDto {
  @IsMongoId()
  @IsNotEmpty()
  id: ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;
}
