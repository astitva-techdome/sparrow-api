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
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private readonly contextService: ContextService,
    private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

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
    previousPermissions.permissions.push({
      role: permissionData.role,
      workspaceId: permissionData.workspaceId,
    });
    const updateParams = {
      $set: {
        permissions: previousPermissions.permissions,
      },
    };
    const data = await this.db
      .collection("user")
      .findOneAndUpdate(filter, updateParams);
    await this.redisService.set(
      this.configService.get("app.userBlacklistPrefix") +
        permissionData.userId.toString(),
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
    previousPermissions.permissions.map((item: any, value: number) => {
      if (item.workspaceId === permissionData.workspaceId) {
        previousPermissions.permissions[value].role = permissionData.role;
      }
    });
    const updateParams = {
      $set: {
        permissions: previousPermissions.permissions,
      },
    };
    const data = await this.db
      .collection("user")
      .findOneAndUpdate(filter, updateParams);
    await this.redisService.set(
      this.configService.get("app.userBlacklistPrefix") +
        permissionData.userId.toString(),
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
    const filteredPermissionsData = previousPermissions.permissions.filter(
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
      this.configService.get("app.userBlacklistPrefix") +
        permissionData.userId.toString(),
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
