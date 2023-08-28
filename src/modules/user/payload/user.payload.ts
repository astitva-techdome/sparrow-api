import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches, MinLength } from "class-validator";

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
