import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddWorkspaceUserDto {
  @ApiProperty({
    example: "editor",
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class AddUserInWorkspaceDto {
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

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  workspaceId?: string;
}

export class removeUserFromWorkspaceDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;
}
