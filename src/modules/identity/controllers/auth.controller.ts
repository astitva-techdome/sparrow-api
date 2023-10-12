import {
  Controller,
  Body,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import { LoginPayload } from "../payloads/login.payload";
import { UserRepository } from "../repositories/user.repository";
import { FastifyRequest } from "fastify";
import { RefreshTokenGuard } from "@src/modules/common/guards/refresh-token.guard";
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
  async login(@Body() payload: LoginPayload) {
    const user = await this.authService.validateUser(payload);

    if (user.refresh_tokens.length === 5) {
      throw new Error("Maximum request limit reached");
    }
    const accessToken = await this.authService.createToken(user._id);
    const refreshToken = await this.authService.createRefreshToken(user._id);
    await this.userReposistory.addRefreshTokenInUser(
      user._id,
      await this.authService.hashData(refreshToken.token),
    );
    const data = {
      accessToken,
      refreshToken,
    };
    return data;
  }

  @Post("/refresh-token")
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: "Access Token Generated" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refreshToken(@Req() request: RefreshTokenRequest) {
    try {
      const userId = request.user._id;
      const refreshToken = request.user.refreshToken;
      return await this.authService.validateRefreshToken(userId, refreshToken);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
