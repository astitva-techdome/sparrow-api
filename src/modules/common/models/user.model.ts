import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Role } from "../enum/roles.enum";
import { TeamDto } from "./team.model";
import { ObjectId } from "mongodb";

export class User {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AuthProvider)
  authProviders?: AuthProvider[];

  @IsArray()
  @Type(() => TeamDto)
  @ValidateNested({ each: true })
  teams: TeamDto[];

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class UserDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

class AuthProvider {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  oAuthId: string;
}

export class PermissionDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsMongoId()
  @IsNotEmpty()
  id: ObjectId;
}
