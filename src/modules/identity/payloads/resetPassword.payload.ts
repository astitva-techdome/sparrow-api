import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class ResetPasswordPayload {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  name: string;
}

export class VerifyEmailPayload {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    required: true,
  })
  @MinLength(6)
  @IsNotEmpty()
  verificationCode: string;
}
export class UpdatePasswordPayload {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    required: true,
  })
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}
