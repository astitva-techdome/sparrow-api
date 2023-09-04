import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Team } from "../common/models/team.model";
import { Collections } from "../common/enum/database.collection.enum";
import { CreateOrUpdateTeamDto } from "./payload/team.payload";
import { ContextService } from "../common/services/context.service";
import { User } from "../common/models/user.model";

/**
 * Team Service
 */
@Injectable()
export class TeamService {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private readonly contextService: ContextService,
  ) {}

  /**
   * Fetches a team from database by UUID
   * @param {string} id
   * @returns {Promise<Team>} queried team data
   */
  get(id: string) {
    const _id = new ObjectId(id);
    const team = this.db.collection<Team>(Collections.TEAM).findOne({ _id });
    if (!team) {
      throw new BadRequestException(
        "The Team with that id could not be found.",
      );
    }
    return team;
  }

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
        },
      ],
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
   * Delete a team from the database by UUID
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResultObject>} result of the delete operation
   */
  delete(id: string) {
    const _id = new ObjectId(id);
    const deletedTeam = this.db
      .collection<Team>(Collections.TEAM)
      .deleteOne({ _id });
    if (!deletedTeam) {
      throw new BadRequestException(
        "The Team with that id could not be found.",
      );
    }
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
