import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
// import { ContextService } from "../common/services/context.service";
import { ContextService } from "@src/modules/common/services/context.service";
// import { CreateOrUpdateTeamDto, TeamDto } from "./payload/team.payload";
import { CreateOrUpdateTeamDto, TeamDto } from "../payloads/team.payload";
// import { Collections } from "../common/enum/database.collection.enum";
import { Collections } from "@src/modules/common/enum/database.collection.enum";
// import { User } from "../common/models/user.model";
import { User } from "@src/modules/common/models/user.model";
// import { Team } from "../common/models/team.model";
import { Team } from "@src/modules/common/models/team.model";
// import { WorkspaceDto } from "../common/models/workspace.model";
import { WorkspaceDto } from "@src/modules/common/models/workspace.model";

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
          email: user.email,
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

  async HasPermission(data: Array<string>) {
    const user = this.contextService.get("user");
    for (const item of data) {
      if (item.toString() === user._id.toString()) {
        return true;
      }
    }
    throw new BadRequestException("You don't have access");
  }

  async findTeamByTeamId(id: ObjectId) {
    const teamData = await this.db
      .collection(Collections.TEAM)
      .findOne({ _id: id });
    return teamData;
  }

  async updateTeamById(id: ObjectId, updateParams: TeamDto) {
    const updatedTeamParams = {
      $set: updateParams,
    };
    const responseData = await this.db
      .collection(Collections.TEAM)
      .findOneAndUpdate({ _id: id }, updatedTeamParams);
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
