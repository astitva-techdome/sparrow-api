import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { CreateOrUpdateWorkspaceDto } from "../payloads/workspace.payload";
import {
  OwnerInformationDto,
  Workspace,
  WorkspaceType,
} from "@src/modules/common/models/workspace.model";
import { ContextService } from "@src/modules/common/services/context.service";
import { ObjectId, WithId } from "mongodb";
import { Role } from "@src/modules/common/enum/roles.enum";
import { TeamRepository } from "@src/modules/identity/repositories/team.repository";
import { PermissionService } from "@src/modules/workspace/services/permission.service";
import { Team } from "@src/modules/common/models/team.model";
import { PermissionForUserDto } from "../payloads/permission.payload";
import { CollectionDto } from "@src/modules/common/models/collection.model";

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

  async get(id: string): Promise<WithId<Workspace>> {
    try {
      const data = await this.workspaceRepository.get(id);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async checkPermissions(teamData: Team): Promise<Array<PermissionForUserDto>> {
    const teamOwners = teamData.owners;
    const teamUsers = teamData.users;
    const permissionArray = [];
    for (const item of teamOwners) {
      for (const user of teamUsers) {
        let permissionObject;
        if (user.id.toString() === item.toString()) {
          permissionObject = {
            role: Role.ADMIN,
            id: user.id,
          };
          permissionArray.push(permissionObject);
        } else {
          permissionObject = {
            role: Role.READER,
            id: user.id,
          };
          permissionArray.push(permissionObject);
        }
      }
    }
    return permissionArray;
  }

  /**
   * Creates a new workspace in the database
   * @param {CreateOrUpdateWorkspaceDto} workspaceData
   * @returns {Promise<InsertOneWriteOpResult<Workspace>>} result of the insert operation
   */
  async create(workspaceData: CreateOrUpdateWorkspaceDto) {
    try {
      const userId = this.contextService.get("user")._id;
      const teamId = new ObjectId(workspaceData.id);
      let teamData;
      let permissionDataForTeam;
      if (workspaceData.type === WorkspaceType.TEAM) {
        teamData = await this.permissionService.isTeamOwner(teamId);
        permissionDataForTeam = await this.checkPermissions(
          teamData as unknown as Team,
        );
      }
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
      const permissionForUser = [
        {
          role: Role.ADMIN,
          id: userId,
        },
      ];
      const params = {
        name: workspaceData.name,
        owner: ownerInfo,
        permissions:
          workspaceData.type === WorkspaceType.PERSONAL
            ? permissionForUser
            : permissionDataForTeam,
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
        await this.teamRepository.updateTeamById(teamId, updateTeamParams);
      }
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Updates an existing workspace in the database by UUID
   * @param {string} id
   * @param {Partial<Workspace>} updates
   * @returns {Promise<UpdateWriteOpResult>} result of the update operation
   */
  async update(id: string, updates: CreateOrUpdateWorkspaceDto) {
    try {
      const data = await this.workspaceRepository.update(id, updates);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Deletes a workspace from the database by UUID
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResultObject>} result of the delete operation
   */
  async delete(id: string) {
    try {
      const data = await this.workspaceRepository.delete(id);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addCollectionInWorkSpace(
    workspaceId: string,
    collection: CollectionDto,
  ) {
    try {
      const data = await this.get(workspaceId);
      if (!data) {
        throw new NotFoundException("Workspace with this id does't exist");
      }
      await this.workspaceRepository.addCollectionInWorkspace(
        workspaceId,
        collection,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async updateCollectionInWorkSpace(
    workspaceId: string,
    collectionId: string,
    name: string,
  ) {
    try {
      const data = await this.get(workspaceId);
      if (!data) {
        throw new NotFoundException("Workspace with this id does't exist");
      }
      await this.workspaceRepository.updateCollectioninWorkspace(
        workspaceId,
        collectionId,
        name,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteCollectionInWorkSpace(workspaceId: string, collectionId: string) {
    try {
      const data = await this.get(workspaceId);
      if (!data) {
        throw new NotFoundException("Workspace with this id does't exist");
      }

      const filteredCollections = data.collection.filter((collection) => {
        return collection.id.toString() !== collectionId;
      });
      await this.workspaceRepository.deleteCollectioninWorkspace(
        workspaceId,
        filteredCollections,
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
