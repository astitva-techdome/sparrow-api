import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CollectionDTO } from "./collection.model";
import { TeamDto } from "./team.model";

export class Workspace {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @Type(() => CollectionDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  collection?: CollectionDTO;

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
  @IsString()
  @IsNotEmpty()
  name: string;
}
