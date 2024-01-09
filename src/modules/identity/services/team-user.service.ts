import { BadRequestException, Injectable } from "@nestjs/common";
import { TeamRepository } from "../repositories/team.repository";
import {
  AddTeamUserDto,
  CreateOrUpdateTeamUserDto,
} from "../payloads/teamUser.payload";
import { ObjectId, WithId } from "mongodb";
import { ContextService } from "@src/modules/common/services/context.service";
import { UserRepository } from "../repositories/user.repository";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { Team } from "@src/modules/common/models/team.model";
import { ProducerService } from "@src/modules/common/services/kafka/producer.service";
import { TeamRole } from "@src/modules/common/enum/roles.enum";
import { TeamService } from "./team.service";

/**
 * Team User Service
 */
@Injectable()
export class TeamUserService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly contextService: ContextService,
    private readonly userRepository: UserRepository,
    private readonly producerService: ProducerService,
    private readonly teamService: TeamService,
  ) {}

  async HasPermissionToRemove(
    payload: CreateOrUpdateTeamUserDto,
    teamData: Team,
  ): Promise<TeamRole> {
    const currentUser = this.contextService.get("user");
    if (payload.userId === teamData.owner) {
      throw new BadRequestException("You cannot remove Owner");
    } else if (currentUser._id.toString() === teamData.owner) {
      return TeamRole.OWNER;
    } else if (
      teamData.admins.includes(currentUser._id.toString()) &&
      !teamData.admins.includes(payload.userId)
    ) {
      return TeamRole.ADMIN;
    }
    throw new BadRequestException("You don't have access");
  }

  async isUserTeamMember(
    userId: string,
    userArray: Array<any>,
  ): Promise<boolean> {
    for (const item of userArray) {
      if (item.id.toString() === userId && item.role !== TeamRole.MEMBER) {
        throw new BadRequestException(
          "User is already the admin or owner of Team",
        );
      } else if (item.id.toString() === userId) {
        return true;
      }
    }
    throw new BadRequestException(
      "User is not part of team, first add user in Team",
    );
  }

  /**
   * Add a new user in the team
   * @param {CreateOrUpdateTeamUserDto} payload
   * @returns {Promise<InsertOneWriteOpResult<Team>>} result of the insert operation
   */
  async addUser(payload: AddTeamUserDto): Promise<WithId<Team>> {
    const teamFilter = new ObjectId(payload.teamId);
    const teamData = await this.teamRepository.findTeamByTeamId(teamFilter);
    const userFilter = new ObjectId(payload.userId);
    const userData = await this.userRepository.findUserByUserId(userFilter);
    await this.teamService.isTeamOwnerOrAdmin(teamFilter);
    const teamUsers = [...teamData.users];
    const teamAdmins = [...teamData.admins];
    teamUsers.push({
      id: payload.userId,
      email: userData.email,
      name: userData.name,
      role: payload.role === TeamRole.ADMIN ? TeamRole.ADMIN : TeamRole.MEMBER,
    });
    const userTeams = [...userData.teams];
    const userWorkspaces = [...userData.workspaces];
    userTeams.push({
      id: new ObjectId(payload.teamId),
      name: teamData.name,
      role: payload.role === TeamRole.ADMIN ? TeamRole.ADMIN : TeamRole.MEMBER,
    });
    if (payload.role === TeamRole.ADMIN) {
      teamAdmins.push(payload.userId);
      for (const item of teamData.workspaces) {
        userWorkspaces.push({
          teamId: payload.teamId,
          workspaceId: item.id.toString(),
          name: item.name,
        });
      }
    } else {
      for (const item of payload.workspaces) {
        userWorkspaces.push({
          teamId: payload.teamId,
          workspaceId: item.id.toString(),
          name: item.name,
        });
      }
    }
    const updatedTeamParams = {
      users: teamUsers,
      admins: teamAdmins,
    };

    const teamWorkspaces =
      payload.role === TeamRole.ADMIN
        ? [...teamData.workspaces]
        : payload.workspaces;
    const message = {
      teamWorkspaces: teamWorkspaces,
      userId: userData._id,
      role: payload.role,
    };
    await this.producerService.produce(TOPIC.USER_ADDED_TO_TEAM_TOPIC, {
      value: JSON.stringify(message),
    });
    const updateUserParams = {
      teams: userTeams,
      workspaces: userWorkspaces,
    };
    await this.userRepository.updateUserById(userFilter, updateUserParams);

    const updatedTeamResponse = await this.teamRepository.updateTeamById(
      teamFilter,
      updatedTeamParams,
    );
    return updatedTeamResponse;
  }

  async removeUser(payload: CreateOrUpdateTeamUserDto): Promise<WithId<Team>> {
    const teamFilter = new ObjectId(payload.teamId);
    const teamData = await this.teamRepository.findTeamByTeamId(teamFilter);
    const userFilter = new ObjectId(payload.userId);
    const userData = await this.userRepository.findUserByUserId(userFilter);
    const teamAdmins = [...teamData.admins];
    await this.HasPermissionToRemove(payload, teamData);
    let userTeamRole;
    for (const item of userData.teams) {
      if (item.id.toString() === payload.teamId) {
        userTeamRole = item.role;
      }
    }
    const teamUser = [...teamData.users];
    let filteredAdmin;
    const filteredData = teamUser.filter((item) => item.id !== payload.userId);
    if (userTeamRole === TeamRole.ADMIN) {
      filteredAdmin = teamAdmins.filter(
        (id: string) => id.toString() !== payload.userId.toString(),
      );
    }
    const teamUpdatedParams = {
      users: filteredData,
      admins: userTeamRole === TeamRole.ADMIN ? filteredAdmin : teamAdmins,
    };
    const userTeams = [...userData.teams];
    const userFilteredTeams = userTeams.filter(
      (item) => item.id.toString() !== payload.teamId.toString(),
    );
    const userFilteredWorkspaces = userData.workspaces.filter(
      (workspace) => workspace.teamId !== payload.teamId,
    );
    const userUpdatedParams = {
      teams: userFilteredTeams,
      workspaces: userFilteredWorkspaces,
    };
    await this.userRepository.updateUserById(userFilter, userUpdatedParams);
    const teamWorkspaces = [...teamData.workspaces];

    const message = {
      teamWorkspaces: teamWorkspaces,
      userId: userData._id,
      role: userTeamRole,
    };
    await this.producerService.produce(TOPIC.USER_REMOVED_FROM_TEAM_TOPIC, {
      value: JSON.stringify(message),
    });
    const data = await this.teamRepository.updateTeamById(
      teamFilter,
      teamUpdatedParams,
    );
    return data;
  }

  async addAdmin(payload: CreateOrUpdateTeamUserDto): Promise<WithId<Team>> {
    const teamFilter = new ObjectId(payload.teamId);
    const teamData = await this.teamRepository.findTeamByTeamId(teamFilter);
    const teamAdmins = [...teamData.admins];
    await this.teamService.isTeamOwnerOrAdmin(new ObjectId(payload.teamId));
    await this.isUserTeamMember(payload.userId, teamData.users);
    teamAdmins.push(payload.userId);
    const teamUsers = teamData.users;
    for (let index = 0; index < teamUsers.length; index++) {
      if (teamUsers[index].id === payload.userId) {
        teamUsers[index].role = TeamRole.ADMIN;
      }
    }
    const updatedTeamData = {
      admins: teamAdmins,
      users: teamUsers,
    };
    const user = await this.userRepository.getUserById(payload.userId);
    for (let index = 0; index < user.teams.length; index++) {
      if (user.teams[index].id.toString() === payload.teamId) {
        user.teams[index].role = TeamRole.ADMIN;
      }
    }
    for (let index = 0; index < teamData.workspaces.length; index++) {
      let count = 0;
      for (let flag = 0; flag < user.workspaces.length; flag++) {
        if (
          teamData.workspaces[index].id.toString() !==
          user.workspaces[flag].workspaceId
        ) {
          count++;
        }
      }
      if (count === user.workspaces.length) {
        user.workspaces.push({
          workspaceId: teamData.workspaces[index].id.toString(),
          teamId: teamData._id.toString(),
          name: teamData.workspaces[index].name,
        });
      }
    }
    const message = {
      userId: payload.userId,
      teamWorkspaces: teamData.workspaces,
    };
    const response = await this.teamRepository.updateTeamById(
      teamFilter,
      updatedTeamData,
    );
    await this.userRepository.updateUserById(
      new ObjectId(payload.userId),
      user,
    );
    await this.producerService.produce(TOPIC.TEAM_ADMIN_ADDED_TOPIC, {
      value: JSON.stringify(message),
    });
    return response;
  }

  async isTeamAdmin(payload: CreateOrUpdateTeamUserDto): Promise<boolean> {
    const teamDetails = await this.teamRepository.findTeamByTeamId(
      new ObjectId(payload.teamId),
    );
    if (teamDetails.admins.includes(payload.userId)) {
      return true;
    } else if (teamDetails.owner === payload.userId) {
      throw new BadRequestException(
        "You cannot transfer ownership to yourself",
      );
    }
    return false;
  }

  async isTeamOwner(id: string): Promise<boolean> {
    const user = await this.contextService.get("user");
    const teamDetails = await this.teamRepository.findTeamByTeamId(
      new ObjectId(id),
    );
    if (teamDetails.owner !== user._id.toString()) {
      throw new BadRequestException("You don't have access");
    }
    return true;
  }

  async changeOwner(payload: CreateOrUpdateTeamUserDto) {
    const user = await this.contextService.get("user");
    await this.isTeamOwner(payload.teamId);
    const currentUserAdmin = await this.isTeamAdmin(payload);
    const teamDetails = await this.teamRepository.findTeamByTeamId(
      new ObjectId(payload.teamId),
    );
    await this.teamService.isTeamMember(payload.userId, teamDetails.users);
    const teamUsers = [...teamDetails.users];
    for (let index = 0; index < teamUsers.length; index++) {
      if (teamUsers[index].id.toString() === user._id.toString()) {
        teamUsers[index].role = TeamRole.ADMIN;
      } else if (teamUsers[index].id.toString() === payload.userId) {
        teamUsers[index].role = TeamRole.OWNER;
      }
    }
    const teamAdmins = [...teamDetails.admins];
    let filteredAdmin;
    if (currentUserAdmin) {
      filteredAdmin = teamAdmins.filter(
        (adminId) => adminId !== payload.userId,
      );
      filteredAdmin.push(user._id.toString());
    } else {
      teamAdmins.push(user._id.toString());
    }
    const updatedTeamParams = {
      users: teamUsers,
      admins: currentUserAdmin ? filteredAdmin : teamAdmins,
      owner: payload.userId,
    };
    const response = await this.teamRepository.updateTeamById(
      new ObjectId(payload.teamId),
      updatedTeamParams,
    );
    const prevOwnerUserDetails = await this.userRepository.getUserById(
      user._id.toString(),
    );
    const currentOwnerUserDetails = await this.userRepository.getUserById(
      payload.userId,
    );
    const prevOwnerUserTeams = [...prevOwnerUserDetails.teams];
    for (let index = 0; index < prevOwnerUserTeams.length; index++) {
      if (prevOwnerUserTeams[index].id.toString() === payload.teamId) {
        prevOwnerUserTeams[index].role = TeamRole.ADMIN;
      }
    }
    const currentOwnerUserTeams = [...currentOwnerUserDetails.teams];
    for (let index = 0; index < currentOwnerUserTeams.length; index++) {
      if (currentOwnerUserTeams[index].id.toString() === payload.teamId) {
        currentOwnerUserTeams[index].role = TeamRole.OWNER;
      }
    }
    const currentOwnerUserWorkspaces = [...currentOwnerUserDetails.workspaces];
    if (!currentUserAdmin) {
      for (let index = 0; index < teamDetails.workspaces.length; index++) {
        let count = 0;
        for (let flag = 0; flag < currentOwnerUserWorkspaces.length; flag++) {
          if (
            teamDetails.workspaces[index].id.toString() !==
            currentOwnerUserWorkspaces[flag].workspaceId
          ) {
            count++;
          }
        }
        if (count === currentOwnerUserWorkspaces.length) {
          currentOwnerUserWorkspaces.push({
            workspaceId: teamDetails.workspaces[index].id.toString(),
            teamId: teamDetails._id.toString(),
            name: teamDetails.workspaces[index].name,
          });
        }
      }
    }
    const prevOwnerUpdatedParams = {
      teams: prevOwnerUserTeams,
    };
    await this.userRepository.updateUserById(
      new ObjectId(user._id),
      prevOwnerUpdatedParams,
    );
    const currentOwnerUpdatedParams = {
      teams: currentOwnerUserTeams,
      workspaces: currentOwnerUserWorkspaces,
    };
    await this.userRepository.updateUserById(
      new ObjectId(payload.userId),
      currentOwnerUpdatedParams,
    );
    if (!currentUserAdmin) {
      const message = {
        userId: payload.userId,
        teamWorkspaces: teamDetails.workspaces,
      };
      await this.producerService.produce(TOPIC.TEAM_OWNER_CHANGED_TOPIC, {
        value: JSON.stringify(message),
      });
    }
    return response;
  }
}
