import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from "@nestjs/common";
import { PermissionRepository } from "../permission.repository";
import {
  CreateOrUpdatePermissionDto,
  PermissionDto,
} from "../payload/permission.payload";
import { ObjectId } from "mongodb";
import { RemovePermissionDto } from "../payload/removePermission.payload";
import { Role } from "@src/modules/common/enum/roles.enum";
// import { ContextService } from "@src/modules/common/services/context.service";
import { UserRepository } from "@src/modules/user/user.repository";
import { ConfigService } from "@nestjs/config";
/**
 * Permission Service
 */
@Injectable()
export class PermissionService {
  userBlacklistPrefix: string;
  constructor(
    @Inject(forwardRef(() => UserRepository))
    private readonly permissionRepository: PermissionRepository,
    // private readonly contextService: ContextService,
    // private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
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

  async permissionToRemove(
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
    // const userPermissions = this.contextService.get("user").permissions;
    // await this.userHasPermission(userPermissions, permissionData);
    // const filter = new ObjectId(permissionData.userId);
    // const userData = await this.userRepository.findUserByUserId(filter);
    // const updatedPermissions = [...userData.permissions];
    // updatedPermissions.push({
    //   role: permissionData.role,
    //   workspaceId: permissionData.workspaceId,
    // });
    // const updatedPermissionParams = {
    //   permissions: updatedPermissions,
    // };
    // const response = await this.userRepository.updateUserById(
    //   filter,
    //   updatedPermissionParams,
    // );
    return permissionData;
  }

  async remove(permissionData: RemovePermissionDto) {
    return await this.permissionRepository.remove(permissionData);
  }

  async setAdminPermissionForOwner(_id: ObjectId) {
    return await this.permissionRepository.setAdminPermissionForOwner(_id);
  }
}
