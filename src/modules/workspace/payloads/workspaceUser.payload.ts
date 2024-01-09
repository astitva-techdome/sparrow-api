import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddWorkspaceUserDto {
  @ApiProperty({
    example: "editor",
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    example: "64f878a0293b1e4415866493",
  })
  @IsMongoId()
  @IsNotEmpty()
  teamId: string;
}

export class AddUserInWorkspcaeDto {
  @ApiProperty({
    example: "editor",
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: "64f878a0293b1e4415866493",
  })
  @IsMongoId()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  workspaceId?: string;
}
