import { BadRequestException, Injectable } from "@nestjs/common";
import { WorkspaceRepository } from "../workspace.repository";
import { CreateOrUpdateWorkspaceDto } from "../payload/workspace.payload";
import {
  OwnerInformationDto,
  WorkspaceType,
} from "@src/modules/common/models/workspace.model";
import { ContextService } from "@src/modules/common/services/context.service";
import { ObjectId } from "mongodb";
import { Role } from "@src/modules/common/enum/roles.enum";
import { TeamRepository } from "@src/modules/team/team.repository";
import { PermissionService } from "@src/modules/permission/services/permission.service";
/**
 * Workspace Service
 */
@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly contextService: ContextService,
    private readonly teamRepository: TeamRepository,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Fetches a workspace from database by UUID
   * @param {string} id
   */
  async get(id: string) {
    return await this.workspaceRepository.get(id);
  }

  async HasPermission(id: ObjectId) {
    const data = await this.teamRepository.findTeamByTeamId(id);
    const userId = this.contextService.get("user")._id;
    if (data) {
      for (const item of data.owners) {
        if (item.toString() === userId.toString()) {
          return true;
        }
      }
      throw new BadRequestException("You don't have access");
    }
    throw new BadRequestException("Team doesn't exist");
  }

  /**
   * Creates a new workspace in the database
   * @param {CreateOrUpdateWorkspaceDto} workspaceData
   * @returns {Promise<InsertOneWriteOpResult<Workspace>>} result of the insert operation
   */
  async create(workspaceData: CreateOrUpdateWorkspaceDto) {
    const userId = this.contextService.get("user")._id;
    const teamIDFilter = new ObjectId(workspaceData.id);
    if (workspaceData.type === WorkspaceType.TEAM) {
      await this.HasPermission(teamIDFilter);
    }
    const teamData = await this.teamRepository.findTeamByTeamId(teamIDFilter);
    const ownerInfo: OwnerInformationDto = {
      id:
        workspaceData.type === WorkspaceType.PERSONAL
          ? userId
          : workspaceData.id,
      name:
        workspaceData.type === WorkspaceType.PERSONAL
          ? this.contextService.get("user").name
          : teamData.name,
      type: workspaceData.type as WorkspaceType,
    };
    const params = {
      name: workspaceData.name,
      owner: ownerInfo,
      createdAt: new Date(),
      createdBy: userId,
    };
    const response = await this.workspaceRepository.addWorkspace(params);
    if (workspaceData.type === WorkspaceType.TEAM) {
      const teamWorkspaces = [...teamData.workspaces];
      teamWorkspaces.push({
        id: response.insertedId,
        name: workspaceData.name,
      });
      const updateTeamParams = {
        workspaces: teamWorkspaces,
      };
      await this.teamRepository.updateTeamById(teamIDFilter, updateTeamParams);
      // const userIdFilter = new ObjectId(userId);
      // const userData = await this.userRepository.findUserByUserId(userIdFilter);
      // const updatedPermissions = [...userData.permissions];
      // updatedPermissions.push({
      //   role: Role.ADMIN,
      //   workspaceId: response.insertedId,
      // });
      // const updatedPermissionParams = {
      //   permissions: updatedPermissions,
      // };
      // await this.userRepository.updateUserById(
      //   userIdFilter,
      //   updatedPermissionParams,
      // );
      const addPermissionPayload = {
        role: Role.ADMIN,
        workspaceId: response.insertedId.toString(),
        userId: userId.toString(),
      };
      await this.permissionService.addPermissionInUser(addPermissionPayload);
    }
    return response;
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
