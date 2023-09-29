import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@src/modules/common/enum/roles.enum";
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { ObjectId } from "mongodb";

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
  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;
}

export class PermissionDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsMongoId()
  @IsNotEmpty()
  id: ObjectId;
}
