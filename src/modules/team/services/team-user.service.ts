import { BadRequestException, Injectable } from "@nestjs/common";
import { TeamRepository } from "../team.repository";
import { CreateOrUpdateTeamUserDto } from "../payload/teamUser.payload";
import { ObjectId } from "mongodb";
import { ContextService } from "@src/modules/common/services/context.service";
import { Role } from "@src/modules/common/enum/roles.enum";
import { PermissionService } from "@src/modules/permission/services/permission.service";
import { CommonUserRepository } from "@src/modules/common/repository/common-user.repository";

/**
 * Team User Service
 */
@Injectable()
export class TeamUserService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly contextService: ContextService,
    private readonly permissionService: PermissionService,
    private readonly commonUserRepository: CommonUserRepository,
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
    const userData = await this.commonUserRepository.findUserByUserId(
      userFilter,
    );
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
    const userPermissions = [...userData.permissions];
    const teamWorkspaces = [...teamData.workspaces];
    teamWorkspaces.map((item: any) => {
      userPermissions.push({
        role: Role.READER,
        workspaceId: item.id,
      });
    });
    const updateUserParams = {
      teams: updatedTeams,
      permissions: userPermissions,
    };
    await this.commonUserRepository.updateUserById(
      userFilter,
      updateUserParams,
    );
    return updatedTeamResponse;
  }

  async removeUser(payload: CreateOrUpdateTeamUserDto) {
    const teamFilter = new ObjectId(payload.teamId);
    const teamData = await this.teamRepository.findTeamByTeamId(teamFilter);
    const userFilter = new ObjectId(payload.userId);
    const userData = await this.commonUserRepository.findUserByUserId(
      userFilter,
    );
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
    const updatedTeamResponse = await this.teamRepository.updateTeamById(
      teamFilter,
      teamUpdatedParams,
    );
    const userTeams = [...userData.teams];
    const userFilteredTeams = userTeams.filter(
      (item) => item.id !== payload.teamId,
    );
    const userUpdatedParams = {
      teams: userFilteredTeams,
    };
    await this.commonUserRepository.updateUserById(
      userFilter,
      userUpdatedParams,
    );
    const userPermissions = [...teamData.workspaces];
    for (const item of userPermissions) {
      await this.permissionService.remove({
        userId: userData._id.toString(),
        workspaceId: item.id,
      });
    }
    return updatedTeamResponse;
  }
}
