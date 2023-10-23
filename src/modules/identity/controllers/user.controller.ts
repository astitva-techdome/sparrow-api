import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { RegisterPayload } from "../payloads/register.payload";
import { UpdateUserDto } from "../payloads/user.payload";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
import { FastifyReply } from "fastify";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
import {
  ResetPasswordPayload,
  UpdatePasswordPayload,
  VerifyEmailPayload,
} from "../payloads/resetPassword.payload";
import { RefreshTokenGuard } from "@src/modules/common/guards/refresh-token.guard";
import { RefreshTokenRequest } from "./auth.controller";
import { JwtAuthGuard } from "@src/modules/common/guards/jwt-auth.guard";
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
  @UseGuards(JwtAuthGuard, BlacklistGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @Post("send-verification-email")
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(
    @Body() resetPasswordDto: ResetPasswordPayload,
    @Res() res: FastifyReply,
  ) {
    try {
      await this.userService.sendVerificationEmail(resetPasswordDto);
      const responseData = new ApiResponseService(
        "Email Sent Successfully",
        HttpStatusCode.OK,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  @Get("logout")
  @UseGuards(RefreshTokenGuard)
  @ApiResponse({ status: 200, description: "Logout Successfull" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  async logoutUser(
    @Req() request: RefreshTokenRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const userId = request.user._id;
      const refreshToken = request.user.refreshToken;
      await this.userService.logoutUser(userId, refreshToken);
      const responseData = new ApiResponseService(
        "User Logout",
        HttpStatusCode.OK,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post("verify-email")
  @ApiResponse({ status: 200, description: "Email Verified" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  async verifyEmail(
    @Res() res: FastifyReply,
    @Body() verifyEmailPayload: VerifyEmailPayload,
  ) {
    try {
      await this.userService.verifyVerificationCode(
        verifyEmailPayload.email,
        verifyEmailPayload.verificationCode,
      );
      const responseData = new ApiResponseService(
        "Email Verified Successfully",
        HttpStatusCode.OK,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  @Post("change-password")
  @ApiResponse({ status: 200, description: "Email Verified" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  async updatePassword(
    @Res() res: FastifyReply,
    @Body() updatePasswordPayload: UpdatePasswordPayload,
  ) {
    try {
      await this.userService.updatePassword(
        updatePasswordPayload.email,
        updatePasswordPayload.newPassword,
      );
      const responseData = new ApiResponseService(
        "Password Updated",
        HttpStatusCode.OK,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
