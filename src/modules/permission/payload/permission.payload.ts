import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@src/modules/common/enum/roles.enum";
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { ObjectId } from "mongodb";

export class CreateOrUpdatePermissionDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  userId: ObjectId;

  @ApiProperty()
  @IsEnum(Role)
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  workspaceId: ObjectId;
}
