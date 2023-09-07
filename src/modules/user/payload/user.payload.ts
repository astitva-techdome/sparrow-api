import { ApiProperty } from "@nestjs/swagger";
import { TeamDto } from "@src/modules/common/models/team.model";
import { PermissionDto } from "@src/modules/common/models/user.model";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  /**
   * Name field
   */
  @ApiProperty()
  @Matches(/^[a-zA-Z ]+$/)
  @IsNotEmpty()
  name: string;

  /**
   * Password field
   */
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class UserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsOptional()
  @Type(() => PermissionDto)
  permissions?: PermissionDto[];

  @IsArray()
  @IsOptional()
  @Type(() => TeamDto)
  teams?: TeamDto[];
}
