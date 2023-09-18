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
// import { TeamService } from "./services/team.service";
import { TeamService } from "../services/team.service";
// import { CreateOrUpdateTeamDto } from "./payload/team.payload";
import { CreateOrUpdateTeamDto } from "../payloads/team.payload";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
// import { BlacklistGuard } from "../common/guards/blacklist.guard";
// import { TeamUserService } from "./services/team-user.service";
import { TeamUserService } from "../services/team-user.service";
// import { CreateOrUpdateTeamUserDto } from "./payload/teamUser.payload";
import { CreateOrUpdateTeamUserDto } from "../payloads/teamUser.payload";

/**
 * Team Controller
 */
@ApiBearerAuth()
@ApiTags("team")
@Controller("api/team")
@UseGuards(AuthGuard("jwt"), BlacklistGuard)
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamUserService: TeamUserService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: "Team Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Team Failed" })
  async createTeam(@Body() createTeamDto: CreateOrUpdateTeamDto) {
    return await this.teamService.create(createTeamDto);
  }

  @Get(":teamId")
  @ApiResponse({ status: 200, description: "Fetch Team Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Team Request Failed" })
  async getTeam(@Param("teamId") teamId: string) {
    return await this.teamService.get(teamId);
  }

  @Delete(":teamId")
  @ApiResponse({ status: 200, description: "Team Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Team Failed" })
  async deleteTeam(@Param("teamId") teamId: string) {
    await this.teamService.delete(teamId);
    return { message: "Team deleted successfully" };
  }

  @Post("user")
  @ApiResponse({ status: 201, description: "Team Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Team Failed" })
  async addUserInTeam(@Body() addTeamUserDto: CreateOrUpdateTeamUserDto) {
    return await this.teamUserService.addUser(addTeamUserDto);
  }

  @Delete(":teamId/user/:userId")
  @ApiResponse({ status: 201, description: "Team Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Team Failed" })
  async removeUserInTeam(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
  ) {
    return await this.teamUserService.removeUser({ teamId, userId });
  }
}
