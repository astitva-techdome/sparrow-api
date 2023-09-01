import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@src/modules/common/enum/roles.enum";
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateOrUpdatePermissionDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsEnum(Role)
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
