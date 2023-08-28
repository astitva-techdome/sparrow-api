import { Controller, Body, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "@auth/auth.service";
import { LoginPayload } from "@auth/payload/login.payload";
import { UserService } from "../user/user.service";

/**
 * Authentication Controller
 */
@Controller("api/auth")
@ApiTags("authentication")
export class AuthController {
  /**
   * Constructor
   * @param {AuthService} authService authentication service
   * @param {UserService} userService user service
   */
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
    return await this.authService.createToken(user._id);
  }
}
