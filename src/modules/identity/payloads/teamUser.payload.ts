import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsMongoId, IsString, IsOptional } from "class-validator";

export class CreateOrUpdateTeamUserDto {
  @ApiProperty({ example: "64f03af32e420f7f68055b92" })
  @IsMongoId()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ example: "64f03af32e420f7f68055b92" })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsOptional()
  workspaceId?: string;
}
