import { Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import {
  OwnerInformationDto,
  Workspace,
  WorkspaceType,
} from "../common/models/workspace.model";
import { Collections } from "../common/enum/database.collection.enum";
import { CreateOrUpdateWorkspaceDto } from "./payload/workspace.payload";
import { ContextService } from "../common/services/context.service";
import { PermissionService } from "../permission/permission.service";
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
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private contextService: ContextService,
    private permissionService: PermissionService,
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
   * @param {CreateOrUpdateWorkspaceDto} workspaceData
   * @returns {Promise<InsertOneWriteOpResult<Workspace>>} result of the insert operation
   */
  async create(workspaceData: CreateOrUpdateWorkspaceDto) {
    const ownerInfo: OwnerInformationDto = {
      id:
        workspaceData.type === WorkspaceType.PERSONAL
          ? this.contextService.get("user")._id
          : workspaceData.team.id,
      name:
        workspaceData.type === WorkspaceType.PERSONAL
          ? this.contextService.get("user").name
          : workspaceData.team.name,
      type: workspaceData.type as WorkspaceType,
    };

    const params = {
      owner: ownerInfo,
      createdAt: new Date(),
      createdBy: this.contextService.get("user")._id,
    };

    await this.db
      .collection<Workspace>(Collections.WORKSPACE)
      .insertOne({ ...workspaceData, ...params });

    if (workspaceData.type === WorkspaceType.TEAM) {
      await this.permissionService.setAdminPermissionForOwner(
        new ObjectId(workspaceData.team.id),
      );
    }
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
