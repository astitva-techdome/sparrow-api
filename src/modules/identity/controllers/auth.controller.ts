import { Controller, Body, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import { LoginPayload } from "../payloads/login.payload";

/**
 * Authentication Controller
 */
@Controller("api/auth")
@ApiTags("authentication")
export class AuthController {
  /**
   * Constructor
   * @param {AuthService} authService authentication service
   */
  constructor(private readonly authService: AuthService) {}

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
    return await this.authService.createToken(user._id);
  }
}
