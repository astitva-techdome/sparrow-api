import { Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "@app/app.service";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

/**
 * App Controller
 */
@Controller()
@ApiBearerAuth()
export class AppController {
  /**
   * Constructor
   * @param appService
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Returns the an environment variable from config file
   * @returns {string} the application environment url
   */
  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, description: "Request Received" })
  @ApiResponse({ status: 400, description: "Request Failed" })
  getString(): string {
    return this.appService.root();
  }
}
