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
import { BlacklistGuard } from "../common/guards/blacklist.guard";

/**
 * User Controller
 */
@ApiBearerAuth()
@ApiTags("user")
@Controller("api/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponse({ status: 201, description: "Registration Completed" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async register(@Body() payload: RegisterPayload) {
    return await this.userService.createUser(payload);
  }

  @Get(":userId")
  @UseGuards(AuthGuard("jwt"), BlacklistGuard)
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
