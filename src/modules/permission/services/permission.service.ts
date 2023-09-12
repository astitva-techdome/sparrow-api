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
import { UserRepository } from "@src/modules/user/user.repository";
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
    const filter = new ObjectId(permissionData.userId);
    const userData = await this.userRepository.findUserByUserId(filter);
    const updatedPermissions = [...userData.permissions];
    updatedPermissions.push({
      role: permissionData.role,
      workspaceId: permissionData.workspaceId,
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

  async setAdminPermissionForOwner(_id: ObjectId) {
    return await this.permissionRepository.setAdminPermissionForOwner(_id);
  }
}
