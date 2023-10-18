import {
  Controller,
  Body,
  Post,
  UseGuards,
  BadRequestException,
  Get,
  Req,
  Res,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ContextService } from "@src/modules/common/services/context.service";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import { LoginPayload } from "../payloads/login.payload";
import { UserRepository } from "../repositories/user.repository";
import { FastifyReply, FastifyRequest } from "fastify";
import { RefreshTokenGuard } from "@src/modules/common/guards/refresh-token.guard";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
/**
 * Authentication Controller
 */
export interface RefreshTokenRequest extends FastifyRequest {
  user: {
    _id: string;
    refreshToken: string;
  };
}
@Controller("api/auth")
@ApiTags("authentication")
export class AuthController {
  /**
   * Constructor
   * @param {AuthService} authService authentication service
   */
  constructor(
    private readonly authService: AuthService,
    private readonly contextService: ContextService,
    private readonly userReposistory: UserRepository,
  ) {}

  /**
   * Login route to validate and create tokens for users
   * @param {LoginPayload} payload the login dto
   */
  @Post("login")
  @ApiResponse({ status: 201, description: "Login Completed" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() payload: LoginPayload, @Res() res: FastifyReply) {
    try {
      const user = await this.authService.validateUser(payload);

      await this.authService.checkRefreshTokenSize(user);
      const tokenPromises = [
        this.authService.createToken(user._id),
        this.authService.createRefreshToken(user._id),
      ];
      const [accessToken, refreshToken] = await Promise.all(tokenPromises);

      const data = {
        accessToken,
        refreshToken,
      };
      const responseData = new ApiResponseService(
        "Login Successfull",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post("/refresh-token")
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: "Access Token Generated" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refreshToken(
    @Req() request: RefreshTokenRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      const userId = request.user._id;
      const refreshToken = request.user.refreshToken;
      const data = await this.authService.validateRefreshToken(
        userId,
        refreshToken,
      );
      const responseData = new ApiResponseService(
        "Token Generated",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googlelogin() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async callback(@Req() req: any, @Res() res: any) {
    const jwt = await this.authService.createToken(req.user);
    res.header("authorization", jwt.token);
    res.redirect(301, `${process.env.APP_URL}:3000/`);
    this.contextService.set("user", req.user);
    return res.send(jwt.token);
  }
}
