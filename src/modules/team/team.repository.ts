import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { ContextService } from "../common/services/context.service";
import { CreateOrUpdateTeamDto } from "./payload/team.payload";
import { Collections } from "../common/enum/database.collection.enum";
import { User } from "../common/models/user.model";
import { Team } from "../common/models/team.model";
import { CreateOrUpdateTeamUserDto } from "./payload/user.payload";
import { WorkspaceDto } from "../common/models/workspace.model";

/**
 * Team Service
 */
@Injectable()
export class TeamRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private readonly contextService: ContextService,
  ) {}

  /**
   * Creates a new team in the database
   * @param {CreateOrUpdateTeamDto} teamData
   * @returns {Promise<InsertOneWriteOpResult<Team>>} result of the insert operation
   */
  async create(teamData: CreateOrUpdateTeamDto) {
    const user = this.contextService.get("user");
    const exists = await this.doesTeamExistsForUser(user._id, teamData.name);
    if (exists) {
      throw new BadRequestException("The Team with that name already exists.");
    }
    const params = {
      users: [
        {
          id: user._id,
          name: user.name,
        },
      ],
      workspaces: [] as WorkspaceDto[],
      owners: [user._id],
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdTeam = await this.db
      .collection<Team>(Collections.TEAM)
      .insertOne({
        ...teamData,
        ...params,
      });

    await this.db.collection<User>(Collections.USER).updateOne(
      { _id: user._id },
      {
        $set: {
          teams: [{ id: createdTeam.insertedId, name: teamData.name }],
        },
      },
    );
    return createdTeam;
  }

  /**
   * Fetches a team from database by UUID
   * @param {string} id
   * @returns {Promise<Team>} queried team data
   */
  async get(id: string) {
    const _id = new ObjectId(id);
    const team = await this.db
      .collection<Team>(Collections.TEAM)
      .findOne({ _id });
    if (!team) {
      throw new BadRequestException(
        "The Team with that id could not be found.",
      );
    }
    return team;
  }

  /**
   * Updates a team name
   * @param {string} id
   * @returns {Promise<ITeam>} mutated team data
   */
  async update(id: string, payload: CreateOrUpdateTeamDto) {
    const _id = new ObjectId(id);
    const updatedTeam = await this.db
      .collection<Team>(Collections.TEAM)
      .updateOne({ _id }, { $set: payload });
    if (!updatedTeam.matchedCount) {
      throw new BadRequestException(
        "The teams with that id does not exist in the system.",
      );
    }
    return updatedTeam;
  }

  /**
   * Delete a team from the database by UUID
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResultObject>} result of the delete operation
   */
  async delete(id: string) {
    const _id = new ObjectId(id);
    const deletedTeam = await this.db
      .collection<Team>(Collections.TEAM)
      .deleteOne({ _id });
    if (!deletedTeam) {
      throw new BadRequestException(
        "The Team with that id could not be found.",
      );
    }
  }

  async HasPermission(data: any) {
    const user = this.contextService.get("user");
    const ownersData = data.owners;
    for (const item of ownersData) {
      if (item.toString() === user._id.toString()) {
        return true;
      }
    }
    throw new BadRequestException("You don't have access");
  }

  async addUser(payload: CreateOrUpdateTeamUserDto) {
    const teamFilter = { _id: new ObjectId(payload.teamId) };
    const teamData = await this.db.collection("team").findOne(teamFilter);
    const userFilter = { _id: new ObjectId(payload.userId) };
    const userData = await this.db.collection("user").findOne(userFilter);
    await this.HasPermission(teamData);
    const updatedUsers = [...teamData.users];
    updatedUsers.push({
      id: payload.userId,
      name: userData.name,
    });
    const updatedUserParams = {
      $set: {
        users: updatedUsers,
      },
    };
    const responseData = await this.db
      .collection("team")
      .findOneAndUpdate(teamFilter, updatedUserParams);
    const updatedTeams = [...userData.teams];
    updatedTeams.push({
      id: payload.teamId,
      name: teamData.name,
    });
    const updateTeamsParams = {
      $set: {
        teams: updatedTeams,
      },
    };
    await this.db
      .collection("user")
      .findOneAndUpdate(userFilter, updateTeamsParams);
    const userPermissions = [...userData.permissions];
    const teamWorkspaces = [...teamData.workspaces];
    teamWorkspaces.map((item: any) => {
      userPermissions.push({
        role: "reader",
        workspaceId: item.id,
      });
    });
    const updatedPermissions = {
      $set: {
        permissions: userPermissions,
      },
    };
    await this.db
      .collection("user")
      .findOneAndUpdate(userFilter, updatedPermissions);
    return responseData;
  }

  async removeUser(payload: CreateOrUpdateTeamUserDto) {
    const teamFilter = { _id: new ObjectId(payload.teamId) };
    const teamData = await this.db.collection("team").findOne(teamFilter);
    const userFilter = { _id: new ObjectId(payload.userId) };
    const userData = await this.db.collection("user").findOne(userFilter);
    await this.HasPermission(teamData);
    const teamUser = [...teamData.users];
    const filteredData = teamUser.filter(
      (item: any) => item.id !== payload.userId,
    );
    const teamUpdatedParams = {
      $set: {
        users: filteredData,
      },
    };
    const responseData = await this.db
      .collection("team")
      .findOneAndUpdate(teamFilter, teamUpdatedParams);
    const userTeams = [...userData.teams];
    const userFilteredTeams = userTeams.filter(
      (item: any) => item.id !== payload.teamId,
    );
    const userUpdatedParams = {
      $set: {
        teams: userFilteredTeams,
      },
    };
    await this.db
      .collection("user")
      .findOneAndUpdate(userFilter, userUpdatedParams);
    return responseData;
  }

  private async doesTeamExistsForUser(userId: ObjectId, teamName: string) {
    return await this.db.collection<User>(Collections.USER).findOne({
      _id: userId,
      teams: {
        $elemMatch: {
          name: teamName,
        },
      },
    });
  }
}
