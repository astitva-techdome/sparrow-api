import {
  Controller,
  Body,
  Get,
  Delete,
  Post,
  UseGuards,
  Param,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TeamService } from "./team.service";
import { CreateOrUpdateTeamDto } from "./payload/team.payload";

/**
 * Team Controller
 */
@ApiBearerAuth()
@ApiTags("team")
@Controller("api/team")
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 201, description: "Team Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Team Failed" })
  async createTeam(@Body() createTeamDto: CreateOrUpdateTeamDto) {
    return await this.teamService.create(createTeamDto);
  }

  @Get(":teamId")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, description: "Fetch Team Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Team Request Failed" })
  async getTeam(@Param("teamId") teamId: string) {
    return await this.teamService.get(teamId);
  }

  @Delete(":teamId")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, description: "Team Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Team Failed" })
  async deleteTeam(@Param("teamId") teamId: string) {
    await this.teamService.delete(teamId);
    return { message: "Team deleted successfully" };
  }
}
