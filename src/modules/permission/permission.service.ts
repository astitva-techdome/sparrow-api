import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { ContextService } from "../common/services/context.service";
import { CreateOrUpdatePermissionDto } from "./payload/permission.payload";
import { Redis } from "ioredis";
import { Role } from "../common/enum/roles.enum";
import { Team } from "../common/models/team.model";
import { Collections } from "../common/enum/database.collection.enum";
/**
 * Permission Service
 */
@Injectable()
export class PermissionService {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private readonly contextService: ContextService,
    private readonly redis: Redis,
  ) {}

  /**
   * Add a new permission in user in the database
   * @param {CreateOrUpdatePermissionDto} permissionData
   * @returns {Promise<InsertOneWriteOpResult<Permission>>} result of the insert operation
   */
  async create(permissionData: CreateOrUpdatePermissionDto) {
    const userPermissions = this.contextService.get("user").permissions;
    let flag = false;
    userPermissions.map((item: any) => {
      if (
        item.workspaceId === permissionData.workspaceId &&
        item.role !== Role.ADMIN
      ) {
        throw new BadRequestException(
          "You don't have access to update Permissions for this workspace",
        );
      } else if (
        item.workspaceId === permissionData.workspaceId &&
        item.role === Role.ADMIN
      ) {
        flag = true;
      }
    });
    if (flag) {
      const filter = { _id: new ObjectId(permissionData.userId) };
      const previous = await this.db.collection("user").findOne(filter);
      const updateData = [...previous.permissions];
      updateData.push({
        role: permissionData.role,
        workspaceId: permissionData.workspaceId,
      });
      const update = {
        $set: {
          permissions: updateData,
        },
      };
      const data = this.db.collection("user").findOneAndUpdate(filter, update);
      await this.redis.set(
        "app.userBlacklistPrefix",
        permissionData.userId.toString(),
      );
      return data;
    } else {
      throw new BadRequestException(
        "You don't have access to update Permissions for this workspace",
      );
    }
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
