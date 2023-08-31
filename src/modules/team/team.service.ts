import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Team } from "../common/models/team.model";
import { Collections } from "../common/enum/database.collection.enum";
import { CreateOrUpdateTeamDto } from "./payload/team.payload";
import { ContextService } from "../common/services/context.service";

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
  create(teamData: CreateOrUpdateTeamDto) {
    const params = {
      users: [
        {
          id: this.contextService.get("user")._id,
          email: this.contextService.get("user").email,
        },
      ],
      createdAt: new Date(),
      createdBy: this.contextService.get("user")._id,
      updatedAt: new Date(),
    };

    return this.db.collection<Team>(Collections.TEAM).insertOne({
      ...teamData,
      ...params,
    });
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
}
