import { ApiProperty } from "@nestjs/swagger";
import { WorkspaceRole } from "@src/modules/common/enum/roles.enum";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddWorkspaceUserDto {
  @ApiProperty({
    example: WorkspaceRole.EDITOR,
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class AddUserInWorkspaceDto {
  @ApiProperty({
    example: WorkspaceRole.EDITOR,
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
