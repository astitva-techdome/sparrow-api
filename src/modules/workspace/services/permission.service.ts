import { BadRequestException, Injectable } from "@nestjs/common";
import { PermissionRepository } from "../repositories/permission.repository";
import {
  CreateOrUpdatePermissionDto,
  PermissionDto,
} from "../payloads/permission.payload";
import { ObjectId } from "mongodb";
import { RemovePermissionDto } from "../payloads/removePermission.payload";
import { Role } from "@src/modules/common/enum/roles.enum";
import { ConfigService } from "@nestjs/config";
import { ContextService } from "@src/modules/common/services/context.service";
import { RedisService } from "@src/modules/common/services/redis.service";
import {
  WorkspaceDto,
  WorkspaceType,
} from "@src/modules/common/models/workspace.model";
import { UserRepository } from "../../identity/repositories/user.repository";
import { WorkspaceRepository } from "@src/modules/workspace/repositories/workspace.repository";
import { TeamRepository } from "../../identity/repositories/team.repository";
import {
  CreateOrUpdateWorkspaceDto,
  WorkspaceDtoForIdDocument,
} from "../payloads/workspace.payload";
import { UserDto } from "@src/modules/common/models/user.model";
import { TeamDto } from "@src/modules/identity/payloads/team.payload";
import { isString } from "class-validator";
/**
 * Permission Service
 */
@Injectable()
export class PermissionService {
  userBlacklistPrefix: string;
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly contextService: ContextService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly teamRepository: TeamRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {
    this.userBlacklistPrefix = this.configService.get(
      "app.userBlacklistPrefix",
    );
  }

  async userHasPermission(permissionArray: [PermissionDto], userId: ObjectId) {
    for (const item of permissionArray) {
      if (
        item.userId.toString() === userId.toString() &&
        item.role === Role.ADMIN
      ) {
        return true;
      }
    }
    throw new BadRequestException(
      "You don't have access to update Permissions for this workspace",
    );
  }

  async hasPermissionToRemove(
    permissionArray: [PermissionDto],
    permissionData: RemovePermissionDto,
  ) {
    for (const item of permissionArray) {
      if (
        item.userId.toString() === permissionData.workspaceId.toString() &&
        item.role === Role.ADMIN
      ) {
        return true;
      }
    }
    throw new BadRequestException(
      "You don't have access to update Permissions for this workspace",
    );
  }

  /**
   * Add a new permission in user in the database
   * @param {CreateOrUpdatePermissionDto} permissionData
   * @returns {Promise<InsertOneWriteOpResult<Permission>>} result of the insert operation
   */
  async create(permissionData: CreateOrUpdatePermissionDto) {
    const currentUserId = this.contextService.get("user")._id;
    new ObjectId(permissionData.userId);
    const workspaceId = new ObjectId(permissionData.workspaceId);
    const workspaceData = await this.workspaceRepository.findWorkspaceById(
      workspaceId,
    );
    const userPermissions = workspaceData.permissions;
    await this.userHasPermission(userPermissions, currentUserId);
    if (workspaceData.owner.type === WorkspaceType.PERSONAL) {
      throw new BadRequestException(
        "You cannot add memebers in Personal Workspace.",
      );
    }
    workspaceData.permissions.push({
      role: permissionData.role,
      id: permissionData.userId,
    });
    await this.workspaceRepository.update(
      workspaceId.toString(),
      workspaceData as unknown as CreateOrUpdateWorkspaceDto,
    );
    const userData = await this.userRepository.findUserByUserId(
      new ObjectId(permissionData.userId),
    );
    userData.teams.push({
      id: workspaceData.owner.id,
      name: workspaceData.owner.name,
    });
    await this.userRepository.updateUserById(
      new ObjectId(permissionData.userId),
      userData as unknown as UserDto,
    );
    const teamData = await this.teamRepository.findTeamByTeamId(
      new ObjectId(workspaceData.owner.id),
    );
    teamData.users.push({
      id: userData._id,
      email: userData.email,
      name: userData.name,
    });
    await this.teamRepository.updateTeamById(
      new ObjectId(workspaceData.owner.id),
      teamData as unknown as TeamDto,
    );
    await this.redisService.set(
      this.userBlacklistPrefix + permissionData.userId.toString(),
    );
    return "User Added";
  }

  async remove(permissionData: RemovePermissionDto) {
    const userPermissions = this.contextService.get("user").permissions;
    await this.hasPermissionToRemove(userPermissions, permissionData);
    const filter = new ObjectId(permissionData.userId);
    const userData = await this.userRepository.findUserByUserId(filter);
    const updatedPermissions = [...userData.permissions];
    const filteredPermissionsData = updatedPermissions.filter(
      (item) => item.workspaceId !== permissionData.workspaceId,
    );
    const updatedPermissionParams = {
      permissions: filteredPermissionsData,
    };
    const response = await this.userRepository.updateUserById(
      filter,
      updatedPermissionParams,
    );
    await this.redisService.set(
      this.userBlacklistPrefix + permissionData.userId.toString(),
    );
    return response;
  }

  async addPermissionInWorkspace(
    workspaceArray: WorkspaceDto[],
    userId: string,
  ) {
    const updatedIdArray = [];
    for (const item of workspaceArray) {
      if (!isString(item.id)) {
        updatedIdArray.push(item.id);
        continue;
      }
      updatedIdArray.push(new ObjectId(item.id));
    }
    const workspaceDataArray =
      await this.workspaceRepository.findWorkspacesByIdArray(updatedIdArray);
    for (let index = 0; index < workspaceDataArray.length; index++) {
      workspaceDataArray[index].permissions.push({
        role: Role.READER,
        id: userId,
      });
    }
    const workspaceDataPromises = [];
    for (const item of workspaceDataArray) {
      workspaceDataPromises.push(
        this.workspaceRepository.updateWorkspaceById(
          new ObjectId(item._id),
          item as WorkspaceDtoForIdDocument,
        ),
      );
    }
    await Promise.all(workspaceDataPromises);
  }

  async removePermissionInWorkspace(
    workspaceArray: WorkspaceDto[],
    userId: string,
  ) {
    const updatedIdArray = [];
    for (const item of workspaceArray) {
      if (!isString(item.id)) {
        updatedIdArray.push(item.id);
        continue;
      }
      updatedIdArray.push(new ObjectId(item.id));
    }
    const workspaceDataArray =
      await this.workspaceRepository.findWorkspacesByIdArray(updatedIdArray);
    for (let index = 0; index < workspaceDataArray.length; index++) {
      workspaceDataArray[index].permissions = workspaceDataArray[
        index
      ].permissions.filter((item: any) => item.id.toString() !== userId);
    }
    const workspaceDataPromises = [];
    for (const item of workspaceDataArray) {
      workspaceDataPromises.push(
        this.workspaceRepository.updateWorkspaceById(
          new ObjectId(item._id),
          item as WorkspaceDtoForIdDocument,
        ),
      );
    }
    await Promise.all(workspaceDataPromises);
  }

  async updatePermissionForOwner(
    workspaceArray: WorkspaceDto[],
    userId: string,
  ) {
    const updatedIdArray = [];
    for (const item of workspaceArray) {
      if (!isString(item.id)) {
        updatedIdArray.push(item.id);
        continue;
      }
      updatedIdArray.push(new ObjectId(item.id));
    }
    const workspaceDataArray =
      await this.workspaceRepository.findWorkspacesByIdArray(updatedIdArray);
    for (let index = 0; index < workspaceDataArray.length; index++) {
      const permissionLength: Array<WorkspaceDto> =
        workspaceDataArray[index].permissions;
      for (let flag = 0; flag < permissionLength.length; flag++) {
        if (
          workspaceDataArray[index].permissions[flag].id.toString() ===
          userId.toString()
        ) {
          workspaceDataArray[index].permissions[flag].role = Role.ADMIN;
        }
      }
    }
    const workspaceDataPromises = [];
    for (const item of workspaceDataArray) {
      workspaceDataPromises.push(
        this.workspaceRepository.updateWorkspaceById(
          new ObjectId(item._id),
          item as WorkspaceDtoForIdDocument,
        ),
      );
    }
    await Promise.all(workspaceDataPromises);
  }

  async updatePermissionInWorkspace(payload: CreateOrUpdatePermissionDto) {
    await this.isWorkspaceAdmin(new ObjectId(payload.workspaceId));
    const workspaceData = await this.workspaceRepository.findWorkspaceById(
      new ObjectId(payload.workspaceId),
    );
    const workspacePermissions = [...workspaceData.permissions];
    for (let index = 0; index < workspacePermissions.length; index++) {
      if (workspacePermissions[index].id.toString() === payload.userId) {
        workspacePermissions[index].role = payload.role;
      }
    }
    const updatedPermissionParams = {
      permissions: workspacePermissions,
    };
    await this.workspaceRepository.updateWorkspaceById(
      new ObjectId(payload.workspaceId),
      updatedPermissionParams,
    );
    await this.redisService.set(
      this.userBlacklistPrefix + payload.userId.toString(),
    );
  }

  async removeSinglePermissionInWorkspace(payload: RemovePermissionDto) {
    await this.isWorkspaceAdmin(new ObjectId(payload.workspaceId));
    const workspaceData = await this.workspaceRepository.findWorkspaceById(
      new ObjectId(payload.workspaceId),
    );
    const workspacePermissions = [...workspaceData.permissions];
    const filteredPermissionsData = workspacePermissions.filter(
      (item) => item.id.toString() !== payload.userId.toString(),
    );
    const updatedPermissionParams = {
      permissions: filteredPermissionsData,
    };
    await this.workspaceRepository.updateWorkspaceById(
      new ObjectId(payload.workspaceId),
      updatedPermissionParams,
    );
    await this.redisService.set(
      this.userBlacklistPrefix + payload.userId.toString(),
    );
  }

  async setAdminPermissionForOwner(_id: ObjectId) {
    return await this.permissionRepository.setAdminPermissionForOwner(_id);
  }

  async isTeamOwner(id: ObjectId) {
    const data = await this.teamRepository.findTeamByTeamId(id);
    const userId = this.contextService.get("user")._id;
    if (data) {
      for (const item of data.owners) {
        if (item.toString() === userId.toString()) {
          return data;
        }
      }
      throw new BadRequestException("You don't have access");
    }
    throw new BadRequestException("Team doesn't exist");
  }

  async isWorkspaceAdmin(id: ObjectId) {
    const currentUserId = this.contextService.get("user")._id;
    const workspaceData = await this.workspaceRepository.findWorkspaceById(id);
    if (workspaceData) {
      const workspacePermissions = [...workspaceData.permissions];
      for (const item of workspacePermissions) {
        if (
          item.id.toString() === currentUserId.toString() &&
          item.role === Role.ADMIN
        ) {
          return true;
        }
      }
      throw new BadRequestException("You don't have access");
    }
    throw new BadRequestException("Workspace dosen't exist");
  }
}
