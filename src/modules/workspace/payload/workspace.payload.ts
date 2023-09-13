import { ApiProperty } from "@nestjs/swagger";
import { WorkspaceType } from "@src/modules/common/models/workspace.model";
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateOrUpdateWorkspaceDto {
  @ApiProperty({
    example: "64f878a0293b1e4415866493",
  })
  @IsMongoId()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: "workspace 1",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: WorkspaceType.TEAM,
  })
  @IsEnum(WorkspaceType)
  @IsNotEmpty()
  type: WorkspaceType;

  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @IsMongoId()
  @IsOptional()
  createdBy?: string;
}
