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
import { TeamService } from "../services/team.service";
import { CreateOrUpdateTeamDto } from "../payloads/team.payload";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
import { TeamUserService } from "../services/team-user.service";

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

  @Post(":teamId/user/:userId")
  @ApiResponse({ status: 201, description: "User Added Successfully" })
  @ApiResponse({ status: 400, description: "Failed to add user" })
  async addUserInTeam(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
  ) {
    return await this.teamUserService.addUser({ teamId, userId });
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

  @Post(":teamId/owner/:userId")
  @ApiResponse({ status: 201, description: "Team Owner Added Successfully" })
  @ApiResponse({ status: 400, description: "Failed to add team owner" })
  async addTeamOwner(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
  ) {
    return await this.teamUserService.addOwner({ teamId, userId });
  }
}
