import {
  BadRequestException,
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
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
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
    try {
      const data = await this.userService.createUser(payload);
      const responseData = new ApiResponseService(
        "User Created",
        HttpStatusCode.CREATED,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(":userId")
  @UseGuards(AuthGuard("jwt"), BlacklistGuard)
  async getUser(@Param("userId") id: string, @Res() res: FastifyReply) {
    try {
      const data = await this.userService.getUserById(id);
      const responseData = new ApiResponseService(
        "Success",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put(":userId")
  @UseGuards(AuthGuard("jwt"))
  async updateUser(
    @Param("userId") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const data = await this.userService.updateUser(id, updateUserDto);
      const responseData = new ApiResponseService(
        "User Updated",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete(":userId")
  @UseGuards(AuthGuard("jwt"))
  async deleteUser(@Param("userId") id: string, @Res() res: FastifyReply) {
    try {
      const data = await this.userService.deleteUser(id);
      const responseData = new ApiResponseService(
        "User Deleted",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
