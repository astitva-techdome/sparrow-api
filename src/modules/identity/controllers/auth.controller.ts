import {
  Controller,
  Body,
  Post,
  // UseGuards,
  // Get,
  // Req,
  // Res,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "../services/auth.service";
import { LoginPayload } from "../payloads/login.payload";
// import { AuthGuard } from "@nestjs/passport";
import { ContextService } from "@src/modules/common/services/context.service";

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
  constructor(
    private readonly authService: AuthService,
    private readonly contextService: ContextService,
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

  // @Get("google")
  // @UseGuards(AuthGuard("google"))
  // async googlelogin() {}

  // @Get("google/callback")
  // @UseGuards(AuthGuard("google"))
  // async callback(@Req() req: any, @Res() res: any) {
  //   const jwt = await this.authService.login(req.user);
  //   res.header("authorization", jwt.access_token);
  //   res.redirect(301, `${process.env.APP_URL}:3000/`);
  //   this.contextService.set("user", req.user);
  //   return res.send(jwt.access_token);
  // }
}
