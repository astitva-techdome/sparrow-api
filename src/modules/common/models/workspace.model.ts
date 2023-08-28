import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CollectionDto } from "./collection.model";
import { TeamDto } from "./team.model";

export class Workspace {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @Type(() => CollectionDto)
  @ValidateNested({ each: true })
  @IsOptional()
  collection?: CollectionDto;

  @IsArray()
  @Type(() => TeamDto)
  @ValidateNested({ each: true })
  @IsOptional()
  team?: TeamDto[];

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
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
