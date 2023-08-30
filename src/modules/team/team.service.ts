import { Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Team } from "../common/models/team.model";
import { Collections } from "../common/enum/database.collection.enum";
import { CreateOrUpdateTeamDto } from "./payload/team.payload";
import { ContextService } from "../common/services/context.service";
/**
 * Models a typical response for a crud operation
 */
export interface IGenericMessageBody {
  /**
   * Status message to return
   */
  message: string;
}

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
    return this.db.collection<Team>(Collections.TEAM).findOne({ _id });
  }

  /**
   * Creates a new team in the database
   * @param {CreateOrUpdateTeamDto} teamData
   * @returns {Promise<InsertOneWriteOpResult<Team>>} result of the insert operation
   */
  create(teamData: CreateOrUpdateTeamDto) {
    const params = {
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
    return this.db.collection<Team>(Collections.TEAM).deleteOne({ _id });
  }
}
