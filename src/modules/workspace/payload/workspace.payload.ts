import { ApiProperty } from "@nestjs/swagger";
import { TeamDto } from "@src/modules/common/models/team.model";
import { WorkspaceType } from "@src/modules/common/models/workspace.model";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ObjectId } from "mongodb";

export class CreateOrUpdateWorkspaceDto {
  @IsMongoId()
  @IsOptional()
  userId?: ObjectId;

  @ApiProperty({
    example: "collection1",
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

  @ApiProperty({
    example: WorkspaceType.TEAM,
  })
  @Type(() => TeamDto)
  @IsOptional()
  team?: TeamDto;
}
