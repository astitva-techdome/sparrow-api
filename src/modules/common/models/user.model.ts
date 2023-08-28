import {
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

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
  authProviders?: Array<AuthProvider>;

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  permissions?: string[];

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class UserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  roles?: string[];
}

class AuthProvider {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  oAuthId: string;
}
