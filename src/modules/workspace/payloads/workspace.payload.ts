import { ApiProperty } from "@nestjs/swagger";
import { WorkspaceType } from "@src/modules/common/models/workspace.model";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { PermissionDto } from "./permission.payload";
import { Type } from "class-transformer";

export class WorkspaceDto {
  @IsOptional()
  @IsArray()
  users?: string[];

  @IsOptional()
  @IsArray()
  permissions?: PermissionDto[];

  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}

export class CreateWorkspaceDto extends WorkspaceDto {
  @ApiProperty({ example: "64f878a0293b1e4415866493" })
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    example: "workspace 1",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateWorkspaceDto extends WorkspaceDto {
  @ApiProperty({
    example: "workspace 1",
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "Description of Workspace",
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UserDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  role: string;
}

export class WorkspaceDtoForIdDocument {
  @IsMongoId()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsEnum(WorkspaceType)
  @IsNotEmpty()
  type?: WorkspaceType;

  @IsArray()
  @IsOptional()
  owners?: string[];

  @IsArray()
  @Type(() => UserDto)
  @ValidateNested({ each: true })
  @IsOptional()
  users?: UserDto[];

  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
