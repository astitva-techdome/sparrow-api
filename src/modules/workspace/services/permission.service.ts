import { BadRequestException, Injectable } from "@nestjs/common";
import { PermissionRepository } from "../repositories/permission.repository";
import { PermissionDto } from "../payloads/permission.payload";
import { ObjectId } from "mongodb";
import { RemovePermissionDto } from "../payloads/removePermission.payload";
import { Role, WorkspaceRole } from "@src/modules/common/enum/roles.enum";
import { ConfigService } from "@nestjs/config";
import { ContextService } from "@src/modules/common/services/context.service";
import { WorkspaceDto } from "@src/modules/common/models/workspace.model";
import { UserRepository } from "../../identity/repositories/user.repository";
import { WorkspaceRepository } from "@src/modules/workspace/repositories/workspace.repository";
import { TeamRepository } from "../../identity/repositories/team.repository";
import { WorkspaceDtoForIdDocument } from "../payloads/workspace.payload";
import { isString } from "class-validator";
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
    for (let index = 0; index < workspaceDataArray.length; index++) {
      workspaceDataArray[index].users = workspaceDataArray[index].users.filter(
        (item: any) => item.id.toString() !== userId,
      );
      if (role === WorkspaceRole.ADMIN) {
        workspaceDataArray[index].admins = workspaceDataArray[
          index
        ].admins.filter((item: any) => item.id.toString() !== userId);
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
          workspaceDataArray[index].users[flag].role = WorkspaceRole.ADMIN;
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

  async demotePermissionForAdmin(
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
      const usersLength = workspaceDataArray[index].users;
      for (let flag = 0; flag < usersLength.length; flag++) {
        if (
          workspaceDataArray[index].users[flag].id.toString() ===
          userId.toString()
        ) {
          workspaceDataArray[index].users[flag].role = WorkspaceRole.EDITOR;
        }
      }
      workspaceDataArray[index].admins = workspaceDataArray[
        index
      ].admins.filter((item: any) => item.id.toString() !== userId);
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

  async setAdminPermissionForOwner(_id: ObjectId) {
    return await this.permissionRepository.setAdminPermissionForOwner(_id);
  }

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
