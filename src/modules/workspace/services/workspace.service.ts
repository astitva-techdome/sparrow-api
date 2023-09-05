import { Injectable } from "@nestjs/common";
import { WorkspaceRepository } from "../workspace.repository";
import { CreateOrUpdateWorkspaceDto } from "../payload/workspace.payload";
/**
 * Workspace Service
 */
@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  /**
   * Fetches a workspace from database by UUID
   * @param {string} id
   */
  async get(id: string) {
    return await this.workspaceRepository.get(id);
  }

  /**
   * Creates a new workspace in the database
   * @param {CreateOrUpdateWorkspaceDto} workspaceData
   * @returns {Promise<InsertOneWriteOpResult<Workspace>>} result of the insert operation
   */
  async create(workspaceData: CreateOrUpdateWorkspaceDto) {
    return await this.workspaceRepository.create(workspaceData);
  }

  /**
   * Updates an existing workspace in the database by UUID
   * @param {string} id
   * @param {Partial<Workspace>} updates
   * @returns {Promise<UpdateWriteOpResult>} result of the update operation
   */
  async update(id: string, updates: CreateOrUpdateWorkspaceDto) {
    return await this.workspaceRepository.update(id, updates);
  }

  /**
   * Deletes a workspace from the database by UUID
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResultObject>} result of the delete operation
   */
  async delete(id: string) {
    return await this.workspaceRepository.delete(id);
  }
}
