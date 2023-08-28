import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { RegisterPayload } from "../auth/payload/register.payload";
import { UpdateUserDto } from "./payload/user.payload";
import { AuthService } from "../auth/auth.service";

/**
 * User Controller
 */
@ApiBearerAuth()
@ApiTags("user")
@Controller("api/user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Registration route to create and generate tokens for users
   * @param {RegisterPayload} payload the registration dto
   */
  @Post()
  @ApiResponse({ status: 201, description: "Registration Completed" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async register(@Body() payload: RegisterPayload) {
    const user = await this.userService.createUser(payload);
    return await this.authService.createToken(user.insertedId);
  }

  @Get(":userId")
  @UseGuards(AuthGuard("jwt"))
  async getUser(@Param("userId") id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new BadRequestException(
        "The user with that ID could not be found.",
      );
    }
    return user;
  }

  @Put(":userId")
  @UseGuards(AuthGuard("jwt"))
  async updateUser(
    @Param("userId") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(":userId")
  @UseGuards(AuthGuard("jwt"))
  async deleteUser(@Param("userId") id: string) {
    return await this.userService.deleteUser(id);
  }
}
