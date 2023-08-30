import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOrUpdateTeamDto {
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: "team1",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
