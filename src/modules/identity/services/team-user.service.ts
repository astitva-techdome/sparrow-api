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

  async HasPermission(data: Array<string>): Promise<boolean> {
    const user = this.contextService.get("user");
    for (const item of data) {
      if (item.toString() === user._id.toString()) {
        return true;
      }
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
    await this.HasPermission([teamData.owner]);
    const teamUsers = [...teamData.users];
    const teamAdmins = [...teamData.admins];
    teamUsers.push({
      id: payload.userId,
      email: userData.email,
      name: userData.name,
      role: payload.role ?? TeamRole.MEMBER,
    });
    const userTeams = [...userData.teams];
    const userWorkspaces = [...userData.workspaces];
    userTeams.push({
      id: new ObjectId(payload.teamId),
      name: teamData.name,
      role: payload.role ?? TeamRole.MEMBER,
    });
    if (payload.role) {
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
          workspaceId: item.id,
          name: item.name,
        });
      }
    }
    const updatedTeamParams = {
      users: teamUsers,
      admins: teamAdmins,
    };

    const teamWorkspaces = payload.role
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

  // async removeUser(payload: CreateOrUpdateTeamUserDto): Promise<WithId<Team>> {
  //   const teamFilter = new ObjectId(payload.teamId);
  //   const teamData = await this.teamRepository.findTeamByTeamId(teamFilter);
  //   const userFilter = new ObjectId(payload.userId);
  //   const userData = await this.userRepository.findUserByUserId(userFilter);
  //   const teamOwners = teamData.owner;
  //   await this.HasPermission([teamOwners]);
  //   const teamUser = [...teamData.users];
  //   const filteredData = teamUser.filter((item) => item.id !== payload.userId);
  //   const filteredOwner = teamOwners.filter(
  //     (id: string) => id.toString() !== payload.userId.toString(),
  //   );
  //   const teamUpdatedParams = {
  //     users: filteredData,
  //     owners: filteredOwner,
  //   };
  //   const userTeams = [...userData.teams];
  //   const userFilteredTeams = userTeams.filter(
  //     (item) => item.id.toString() !== payload.teamId.toString(),
  //   );
  //   const userUpdatedParams = {
  //     teams: userFilteredTeams,
  //   };
  //   await this.userRepository.updateUserById(userFilter, userUpdatedParams);
  //   const teamWorkspaces = [...teamData.workspaces];
  //   const message = {
  //     teamWorkspaces: teamWorkspaces,
  //     userId: userData._id,
  //   };
  //   await this.producerService.produce(TOPIC.USER_REMOVED_FROM_TEAM_TOPIC, {
  //     value: JSON.stringify(message),
  //   });
  //   const data = await this.teamRepository.updateTeamById(
  //     teamFilter,
  //     teamUpdatedParams,
  //   );
  //   return data;
  // }

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
}
