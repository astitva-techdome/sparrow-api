import { BadRequestException, Injectable } from "@nestjs/common";
import { PermissionRepository } from "../permission.repository";
import {
  CreateOrUpdatePermissionDto,
  PermissionDto,
} from "../payload/permission.payload";
import { ObjectId } from "mongodb";
import { RemovePermissionDto } from "../payload/removePermission.payload";
import { Role } from "@src/modules/common/enum/roles.enum";
import { ConfigService } from "@nestjs/config";
import { ContextService } from "@src/modules/common/services/context.service";
import { RedisService } from "@src/modules/common/services/redis.service";
import { WorkspaceType } from "@src/modules/common/models/workspace.model";
import { TeamUserService } from "@src/modules/team/services/team-user.service";
import { UserRepository } from "@src/modules/user/user.repository";
import { WorkspaceRepository } from "@src/modules/workspace/workspace.repository";
import { TeamRepository } from "@src/modules/team/team.repository";
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
    private readonly teamUserService: TeamUserService,
    private readonly teamRepository: TeamRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {
    this.userBlacklistPrefix = this.configService.get(
      "app.userBlacklistPrefix",
    );
  }

  async userHasPermission(
    permissionArray: [PermissionDto],
    permissionData: CreateOrUpdatePermissionDto,
  ) {
    for (const item of permissionArray) {
      if (
        item.workspaceId.toString() === permissionData.workspaceId.toString() &&
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
        item.workspaceId === permissionData.workspaceId &&
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
    const userPermissions = this.contextService.get("user").permissions;
    await this.userHasPermission(userPermissions, permissionData);
    // const filter = new ObjectId(permissionData.userId);
    const workspaceId = new ObjectId(permissionData.workspaceId);
    const workspaceData = await this.workspaceRepository.findWorkspaceById(
      workspaceId,
    );
    if (workspaceData.owner.type === WorkspaceType.PERSONAL) {
      throw new BadRequestException(
        "You cannot add memebers in Personal Workspace.",
      );
    }
    const permissionParams = {
      teamId: workspaceData.owner.id,
      role: permissionData.role,
      userId: permissionData.userId,
      workspaceId: permissionData.workspaceId,
    };
    const response = await this.teamUserService.addUser(permissionParams);
    // const userData = await this.commonUserRepository.findUserByUserId(filter);
    // const updatedPermissions = [...userData.permissions];
    // updatedPermissions.push({
    //   role: permissionData.role,
    //   workspaceId: permissionData.workspaceId,
    // });
    // const updatedPermissionParams = {
    //   permissions: updatedPermissions,
    // };
    // const response = await this.commonUserRepository.updateUserById(
    //   filter,
    //   updatedPermissionParams,
    // );
    await this.redisService.set(
      this.userBlacklistPrefix + permissionData.userId.toString(),
    );
    return response;
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

  async update(permissionData: CreateOrUpdatePermissionDto) {
    const userPermissions = this.contextService.get("user").permissions;
    await this.userHasPermission(userPermissions, permissionData);
    const filter = new ObjectId(permissionData.userId);
    const userData = await this.userRepository.findUserByUserId(filter);
    const updatedPermissions = [...userData.permissions];
    updatedPermissions.map((item: any, value: number) => {
      if (item.workspaceId === permissionData.workspaceId) {
        updatedPermissions[value].role = permissionData.role;
      }
    });
    const updatedPermissionParams = {
      permissions: updatedPermissions,
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

  async addPermissionInUser(payload: CreateOrUpdatePermissionDto) {
    const userIdFilter = new ObjectId(payload.userId);
    const userData = await this.userRepository.findUserByUserId(userIdFilter);
    const updatedPermissions = [...userData.permissions];
    updatedPermissions.push({
      role: Role.ADMIN,
      workspaceId: payload.workspaceId,
    });
    const updatedPermissionParams = {
      permissions: updatedPermissions,
    };
    const permissionResponse = await this.userRepository.updateUserById(
      userIdFilter,
      updatedPermissionParams,
    );
    return permissionResponse;
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
}
