import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { ContextService } from "../common/services/context.service";
import { CreateOrUpdatePermissionDto } from "./payload/permission.payload";
import { Redis } from "ioredis";
import { Role } from "../common/enum/roles.enum";
import { Team } from "../common/models/team.model";
import { Collections } from "../common/enum/database.collection.enum";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../common/services/redis.service";
import { RemovePermissionDto } from "./payload/removePermission.payload";
/**
 * Permission Repository
 */
@Injectable()
export class PermissionRepository {
  userBlacklistPrefix: string;
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private readonly contextService: ContextService,
    private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.userBlacklistPrefix = this.configService.get(
      "app.userBlacklistPrefix",
    );
  }

  async userHasPermission(
    permissionArray: any,
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
    permissionArray: any,
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
    const filter = { _id: new ObjectId(permissionData.userId) };
    const previousPermissions = await this.db
      .collection("user")
      .findOne(filter, {
        projection: {
          permissions: 1,
        },
      });
    const updatedPermissions = [...previousPermissions.permissions];
    updatedPermissions.push({
      role: permissionData.role,
      workspaceId: permissionData.workspaceId,
    });
    const updateParams = {
      $set: {
        permissions: updatedPermissions,
      },
    };
    const data = await this.db
      .collection("user")
      .findOneAndUpdate(filter, updateParams);
    await this.redisService.set(
      this.userBlacklistPrefix + permissionData.userId.toString(),
      permissionData.userId.toString(),
    );
    return data;
  }

  async update(permissionData: CreateOrUpdatePermissionDto) {
    const userPermissions = this.contextService.get("user").permissions;
    await this.userHasPermission(userPermissions, permissionData);
    const filter = { _id: new ObjectId(permissionData.userId) };
    const previousPermissions = await this.db
      .collection("user")
      .findOne(filter, {
        projection: {
          permissions: 1,
        },
      });
    const updatedPermissions = [...previousPermissions.permissions];
    updatedPermissions.map((item: any, value: number) => {
      if (item.workspaceId === permissionData.workspaceId) {
        updatedPermissions[value].role = permissionData.role;
      }
    });
    const updateParams = {
      $set: {
        permissions: updatedPermissions,
      },
    };
    const data = await this.db
      .collection("user")
      .findOneAndUpdate(filter, updateParams);
    await this.redisService.set(
      this.userBlacklistPrefix + permissionData.userId.toString(),
      permissionData.userId.toString(),
    );
    return data;
  }

  async remove(permissionData: CreateOrUpdatePermissionDto) {
    const userPermissions = this.contextService.get("user").permissions;
    await this.permissionToRemove(userPermissions, permissionData);
    const filter = { _id: new ObjectId(permissionData.userId) };
    const previousPermissions = await this.db
      .collection("user")
      .findOne(filter, {
        projection: {
          permissions: 1,
        },
      });
    const updatedPermissions = [...previousPermissions.permissions];
    const filteredPermissionsData = updatedPermissions.filter(
      (item: any) => item.workspaceId !== permissionData.workspaceId,
    );
    const updateParams = {
      $set: {
        permissions: filteredPermissionsData,
      },
    };
    const data = await this.db
      .collection("user")
      .findOneAndUpdate(filter, updateParams);
    await this.redisService.set(
      this.userBlacklistPrefix + permissionData.userId.toString(),
      permissionData.userId.toString(),
    );
    return data;
  }

  async setAdminPermissionForOwner(_id: ObjectId) {
    return this.db.collection<Team>(Collections.TEAM).findOne(
      { _id },
      {
        projection: {
          owners: 1,
        },
      },
    );
  }
}
