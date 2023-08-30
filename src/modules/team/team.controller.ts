import {
  Controller,
  Body,
  Get,
  Delete,
  Post,
  UseGuards,
  BadRequestException,
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
  async createWorkspace(@Body() createTeamDto: CreateOrUpdateTeamDto) {
    return await this.teamService.create(createTeamDto);
  }

  @Get(":teamId")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, description: "Fetch Team Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Team Request Failed" })
  async getTeam(@Param("teamId") teamId: string) {
    const team = await this.teamService.get(teamId);
    if (!team) {
      throw new BadRequestException(
        "The Team with that id could not be found.",
      );
    }
    return team;
  }

  @Delete(":teamId")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, description: "Team Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Team Failed" })
  async deleteTeam(@Param("teamId") teamId: string) {
    const deletedTeam = await this.teamService.delete(teamId);
    if (!deletedTeam) {
      throw new BadRequestException(
        "The Team with that id could not be found.",
      );
    }
    return { message: "Team deleted successfully" };
  }
}
