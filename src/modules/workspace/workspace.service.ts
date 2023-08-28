import { Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Workspace } from "../common/models/workspace.model";
import { Collections } from "../common/enum/database.collection.enum";
import { CreateOrUpdateWorkspaceDto } from "./payload/workspace.payload";
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
 * Workspace Service
 */
@Injectable()
export class WorkspaceService {
  private userId: string;
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
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

  /**
   * Creates a new workspace in the database
   * @param {CreateWorkspaceDto} workspaceData
   * @returns {Promise<InsertOneWriteOpResult<Workspace>>} result of the insert operation
   */
  create(workspaceData: CreateOrUpdateWorkspaceDto) {
    const defaultParams = {
      createdAt: new Date(),
      createdBy: "123",
    };
    console.log("USERID ====> ", this.userId);
    return this.db
      .collection<Workspace>(Collections.WORKSPACE)
      .insertOne({ ...workspaceData, ...defaultParams });
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
      updatedBy: "456",
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
