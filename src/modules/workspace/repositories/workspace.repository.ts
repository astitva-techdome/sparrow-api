import { Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Workspace } from "../../common/models/workspace.model";
import { Collections } from "../../common/enum/database.collection.enum";
import { CreateOrUpdateWorkspaceDto } from "../payloads/workspace.payload";
import { ContextService } from "../../common/services/context.service";
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
 * Workspace Repository
 */
@Injectable()
export class WorkspaceRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private contextService: ContextService,
  ) {}

  /**
   * Fetches a workspace from database by UUID
   * @param {string} id
   * @returns {Promise<Workspace>} queried workspace data
   */
  get(id: string) {
    const _id = new ObjectId(id);
    return this.db
      .collection<Workspace>(Collections.WORKSPACE)
      .findOne({ _id });
  }

  async addWorkspace(params: Workspace) {
    const response = await this.db
      .collection(Collections.WORKSPACE)
      .insertOne(params);
    return response;
  }

  async findWorkspaceById(id: ObjectId) {
    const response = await this.db
      .collection(Collections.WORKSPACE)
      .findOne({ _id: id });
    return response;
  }

  /**
   * Updates an existing workspace in the database by UUID
   * @param {string} id
   * @param {Partial<Workspace>} updates
   * @returns {Promise<UpdateWriteOpResult>} result of the update operation
   */
  update(id: string, updates: CreateOrUpdateWorkspaceDto) {
    const _id = new ObjectId(id);
    const defaultParams = {
      updatedAt: new Date(),
      updatedBy: this.contextService.get("user")._id,
    };
    return this.db
      .collection<Workspace>(Collections.WORKSPACE)
      .updateOne({ _id }, { $set: { ...updates, ...defaultParams } });
  }

  /**
   * Deletes a workspace from the database by UUID
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResultObject>} result of the delete operation
   */
  delete(id: string) {
    const _id = new ObjectId(id);
    return this.db
      .collection<Workspace>(Collections.WORKSPACE)
      .deleteOne({ _id });
  }
}
