import {
  Controller,
  Body,
  Get,
  Delete,
  Post,
  UseGuards,
  Param,
  Res,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TeamService } from "../services/team.service";
import { CreateOrUpdateTeamDto } from "../payloads/team.payload";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
import { TeamUserService } from "../services/team-user.service";
import { FastifyReply } from "fastify";
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
  async createTeam(
    @Body() createTeamDto: CreateOrUpdateTeamDto,
    @Res() res: FastifyReply,
  ) {
    const data = await this.teamService.create(createTeamDto);
    res.status(data.httpStatusCode).send(data);
  }

  @Get(":teamId")
  @ApiResponse({ status: 200, description: "Fetch Team Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Team Request Failed" })
  async getTeam(@Param("teamId") teamId: string, @Res() res: FastifyReply) {
    const data = await this.teamService.get(teamId);
    res.status(data.httpStatusCode).send(data);
  }

  @Delete(":teamId")
  @ApiResponse({ status: 200, description: "Team Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Team Failed" })
  async deleteTeam(@Param("teamId") teamId: string, @Res() res: FastifyReply) {
    const data = await this.teamService.delete(teamId);
    res.status(data.httpStatusCode).send(data);
  }

  @Post(":teamId/user/:userId")
  @ApiResponse({ status: 201, description: "User Added Successfully" })
  @ApiResponse({ status: 400, description: "Failed to add user" })
  async addUserInTeam(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.teamUserService.addUser({ teamId, userId });
    res.status(data.httpStatusCode).send(data);
  }

  @Delete(":teamId/user/:userId")
  @ApiResponse({ status: 201, description: "User Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Failed to delete user" })
  async removeUserInTeam(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.teamUserService.removeUser({ teamId, userId });
    res.status(data.httpStatusCode).send(data);
  }

  @Post(":teamId/owner/:userId")
  @ApiResponse({ status: 201, description: "Team Owner Added Successfully" })
  @ApiResponse({ status: 400, description: "Failed to add team owner" })
  async addTeamOwner(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.teamUserService.addOwner({ teamId, userId });
    res.status(data.httpStatusCode).send(data);
  }
}
