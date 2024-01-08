import { BadRequestException, Injectable } from "@nestjs/common";
import { PermissionRepository } from "../repositories/permission.repository";
import {
  CreatePermissionDto,
  PermissionDto,
} from "../payloads/permission.payload";
import { ObjectId } from "mongodb";
import { RemovePermissionDto } from "../payloads/removePermission.payload";
import { Role, WorkspaceRole } from "@src/modules/common/enum/roles.enum";
import { ConfigService } from "@nestjs/config";
import { ContextService } from "@src/modules/common/services/context.service";
import {
  Workspace,
  WorkspaceDto,
  WorkspaceType,
} from "@src/modules/common/models/workspace.model";
import { UserRepository } from "../../identity/repositories/user.repository";
import { WorkspaceRepository } from "@src/modules/workspace/repositories/workspace.repository";
import { TeamRepository } from "../../identity/repositories/team.repository";
import {
  UpdateWorkspaceDto,
  WorkspaceDtoForIdDocument,
} from "../payloads/workspace.payload";
import { UserDto } from "@src/modules/common/models/user.model";
import { TeamDto } from "@src/modules/identity/payloads/team.payload";
import { isString } from "class-validator";
// import { Team } from "@src/modules/common/models/team.model";
import { SelectedWorkspaces } from "@src/modules/identity/payloads/teamUser.payload";
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
    private readonly teamRepository: TeamRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {
    this.userBlacklistPrefix = this.configService.get(
      "app.userBlacklistPrefix",
    );
  }

  async userHasPermission(
    permissionArray: [PermissionDto],
    userId: ObjectId,
  ): Promise<boolean> {
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
  ): Promise<boolean> {
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
  async create(permissionData: CreatePermissionDto) {
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
        "You cannot add members in Personal Workspace.",
      );
    }
    workspaceData.permissions.push({
      role: permissionData.role,
      id: permissionData.userId,
    });
    const updatedWOrkspaceData = await this.workspaceRepository.update(
      workspaceId.toString(),
      workspaceData as unknown as UpdateWorkspaceDto,
    );
    const userData = await this.userRepository.findUserByUserId(
      new ObjectId(permissionData.userId),
    );
    userData.teams.push({
      id: workspaceData.owner.id,
      name: workspaceData.owner.name,
      role: "",
    });
    await this.userRepository.updateUserById(
      new ObjectId(permissionData.userId),
      userData as unknown as UserDto,
    );
    const teamData = await this.teamRepository.findTeamByTeamId(
      new ObjectId(workspaceData.owner.id),
    );
    teamData.users.push({
      id: userData._id.toString(),
      email: userData.email,
      name: userData.name,
      role: "",
    });
    await this.teamRepository.updateTeamById(
      new ObjectId(workspaceData.owner.id),
      teamData as unknown as TeamDto,
    );
    return updatedWOrkspaceData;
  }

  async addPermissionInWorkspace(
    workspaceArray: SelectedWorkspaces[],
    userId: string,
    role: string,
  ): Promise<void> {
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
    if (role === WorkspaceRole.ADMIN) {
      const user = await this.userRepository.getUserById(userId);
      for (let index = 0; index < workspaceDataArray.length; index++) {
        workspaceDataArray[index].users.push({
          role: WorkspaceRole.ADMIN,
          id: userId,
        });
        workspaceDataArray[index].admins.push({
          id: userId,
          name: user.name,
        });
      }
    } else {
      for (let index = 0; index < workspaceDataArray.length; index++) {
        for (const item of workspaceArray) {
          if (workspaceDataArray[index]._id.toString() === item.id.toString()) {
            workspaceDataArray[index].users.push({
              role: item.role,
              id: userId,
            });
          }
        }
      }
    }
    // for (let index = 0; index < workspaceDataArray.length; index++) {
    //   if (role === WorkspaceRole) {
    //     for (const item of workspaceArray) {
    //       if (workspaceDataArray[index]._id.toString() === item.id.toString()) {
    //         workspaceDataArray[index].users.push({
    //           role: item.role,
    //           id: userId,
    //         });
    //       }
    //     }
    //   } else {
    //     workspaceDataArray[index].users.push({
    //       role: WorkspaceRole.ADMIN,
    //       id: userId,
    //     });
    //   }
    // }
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
  ): Promise<void> {
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
  ): Promise<void> {
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

  async updatePermissionForAdmin(
    workspaceArray: WorkspaceDto[],
    userId: string,
  ): Promise<void> {
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
      const usersLength: Array<WorkspaceDto> = workspaceDataArray[index].users;
      let count = 0;
      for (let flag = 0; flag < usersLength.length; flag++) {
        if (
          workspaceDataArray[index].users[flag].id.toString() ===
          userId.toString()
        ) {
          workspaceDataArray[index].users[flag].role = Role.ADMIN;
        } else {
          count++;
        }
      }
      if (count === usersLength.length) {
        workspaceDataArray[index].users.push({
          id: userId,
          role: WorkspaceRole.ADMIN,
        });
      }
      const user = await this.userRepository.getUserById(userId);
      workspaceDataArray[index].admins.push({
        id: userId,
        name: user.name,
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

  async updatePermissionInWorkspace(
    payload: CreatePermissionDto,
  ): Promise<Workspace> {
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
    const workspace = await this.workspaceRepository.get(payload.workspaceId);
    return workspace;
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
    const data = await this.workspaceRepository.updateWorkspaceById(
      new ObjectId(payload.workspaceId),
      updatedPermissionParams,
    );
    return data;
  }

  async setAdminPermissionForOwner(_id: ObjectId) {
    return await this.permissionRepository.setAdminPermissionForOwner(_id);
  }

  // async isTeamOwnerOrAdmin(id: ObjectId): Promise<WithId<Team>> {
  //   const data = await this.teamRepository.findTeamByTeamId(id);
  //   const userId = this.contextService.get("user")._id;
  //   if (data) {
  //     if (data.owner.toString() === userId.toString()) {
  //       return data;
  //     } else {
  //       for (const item of data.admins) {
  //         if (item.toString() === userId.toString()) {
  //           return data;
  //         }
  //       }
  //     }
  //     throw new BadRequestException("You don't have access");
  //   }
  //   throw new BadRequestException("Team doesn't exist");
  // }

  async isWorkspaceAdmin(id: ObjectId): Promise<boolean> {
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
