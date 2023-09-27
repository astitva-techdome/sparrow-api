import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { RegisterPayload } from "../payloads/register.payload";
import { UpdateUserDto } from "../payloads/user.payload";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
import { FastifyReply } from "fastify";
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
  async register(@Body() payload: RegisterPayload, @Res() res: FastifyReply) {
    const data = await this.userService.createUser(payload);
    res.status(data.httpStatusCode).send(data);
  }

  @Get(":userId")
  @UseGuards(AuthGuard("jwt"), BlacklistGuard)
  async getUser(@Param("userId") id: string, @Res() res: FastifyReply) {
    const data = await this.userService.getUserById(id);
    res.status(data.httpStatusCode).send(data);
  }

  @Put(":userId")
  @UseGuards(AuthGuard("jwt"))
  async updateUser(
    @Param("userId") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: FastifyReply,
  ) {
    const data = await this.userService.updateUser(id, updateUserDto);
    res.status(data.httpStatusCode).send(data);
  }

  @Delete(":userId")
  @UseGuards(AuthGuard("jwt"))
  async deleteUser(@Param("userId") id: string, @Res() res: FastifyReply) {
    const data = await this.userService.deleteUser(id);
    res.status(data.httpStatusCode).send(data);
  }
}
