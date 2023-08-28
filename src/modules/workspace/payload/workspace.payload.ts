import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrUpdateWorkspaceDto {
  @ApiProperty({
    example: "collection1",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
