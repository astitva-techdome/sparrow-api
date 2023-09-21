import { BadRequestException, Injectable } from "@nestjs/common";
import { TeamRepository } from "../repositories/team.repository";
import { CreateOrUpdateTeamUserDto } from "../payloads/teamUser.payload";
import { ObjectId } from "mongodb";
import { ContextService } from "@src/modules/common/services/context.service";
import { UserRepository } from "../repositories/user.repository";
import { AzureBusService } from "@src/modules/common/services/azureBus/azure-bus.service";
import { TOPIC } from "@src/modules/common/enum/topic.enum";

/**
 * Team User Service
 */
@Injectable()
export class TeamUserService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly contextService: ContextService,
    private readonly userRepository: UserRepository,
    private readonly azureBusService: AzureBusService,
  ) {}

  async HasPermission(data: Array<string>) {
    const user = this.contextService.get("user");
    for (const item of data) {
      if (item.toString() === user._id.toString()) {
        return true;
      }
    }
    throw new BadRequestException("You don't have access");
  }

  /**
   * Add a new user in the team
   * @param {CreateOrUpdateTeamUserDto} payload
   * @returns {Promise<InsertOneWriteOpResult<Team>>} result of the insert operation
   */
  async addUser(payload: CreateOrUpdateTeamUserDto) {
    const teamFilter = new ObjectId(payload.teamId);
    const teamData = await this.teamRepository.findTeamByTeamId(teamFilter);
    const userFilter = new ObjectId(payload.userId);
    const userData = await this.userRepository.findUserByUserId(userFilter);
    await this.HasPermission(teamData.owners);
    const updatedUsers = [...teamData.users];
    updatedUsers.push({
      id: payload.userId,
      email: userData.email,
      name: userData.name,
    });
    const updatedTeamParams = {
      users: updatedUsers,
    };
    const updatedTeamResponse = await this.teamRepository.updateTeamById(
      teamFilter,
      updatedTeamParams,
    );
    const updatedTeams = [...userData.teams];
    updatedTeams.push({
      id: payload.teamId,
      name: teamData.name,
    });
    const teamWorkspaces = [...teamData.workspaces];
    const message = {
      teamWorkspaces: teamWorkspaces,
      userId: userData._id,
    };
    await this.azureBusService.sendMessage(
      TOPIC.USER_ADDED_TO_TEAM_TOPIC,
      message,
    );
    const updateUserParams = {
      teams: updatedTeams,
    };
    await this.userRepository.updateUserById(userFilter, updateUserParams);
    return updatedTeamResponse;
  }

  async removeUser(payload: CreateOrUpdateTeamUserDto) {
    const teamFilter = new ObjectId(payload.teamId);
    const teamData = await this.teamRepository.findTeamByTeamId(teamFilter);
    const userFilter = new ObjectId(payload.userId);
    const userData = await this.userRepository.findUserByUserId(userFilter);
    const teamOwners = teamData.owners;
    await this.HasPermission(teamOwners);
    const teamUser = [...teamData.users];
    const filteredData = teamUser.filter((item) => item.id !== payload.userId);
    const filteredOwner = teamOwners.filter(
      (id: string) => id.toString() !== payload.userId.toString(),
    );
    const teamUpdatedParams = {
      users: filteredData,
      owners: filteredOwner,
    };
    await this.teamRepository.updateTeamById(teamFilter, teamUpdatedParams);
    const userTeams = [...userData.teams];
    const userFilteredTeams = userTeams.filter(
      (item) => item.id !== payload.teamId,
    );
    const userUpdatedParams = {
      teams: userFilteredTeams,
    };
    await this.userRepository.updateUserById(userFilter, userUpdatedParams);
    return "User Removed";
  }
}
