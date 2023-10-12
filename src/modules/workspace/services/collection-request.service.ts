import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { collectionRepository } from "../repositories/collection.repository";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { ObjectId, UpdateResult } from "mongodb";
import { ContextService } from "@src/modules/common/services/context.service";
import {
  CollectionRequest,
  CollectionRequestItem,
  DeleteFolderDto,
  FolderDto,
} from "../payloads/collectionRequest.payload";
import { v4 as uuidv4 } from "uuid";
@Injectable()
export class CollectionRequestService {
  constructor(
    private readonly collectionReposistory: collectionRepository,
    private readonly workspaceReposistory: WorkspaceRepository,
    private readonly contextService: ContextService,
  ) {}

  async addFolder(
    payload: FolderDto,
  ): Promise<UpdateResult<CollectionRequest>> {
    try {
      const user = await this.contextService.get("user");
      const uuid = uuidv4();
      await this.checkPermission(payload.workspaceId, user._id);
      const collection = await this.collectionReposistory.getCollectionRequest(
        payload.collectionId,
      );
      if (!collection) {
        throw new BadRequestException("Collection Not Found");
      }
      const updatedFolder: CollectionRequestItem = {
        id: uuid,
        name: payload.name,
        description: payload.description ?? "",
        type: 0,
        items: [],
      };
      collection.items.push(updatedFolder);
      const data = await this.collectionReposistory.updateCollectionRequest(
        payload.collectionId,
        collection,
      );
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateFolder(
    payload: FolderDto,
  ): Promise<UpdateResult<CollectionRequest>> {
    try {
      const user = await this.contextService.get("user");
      await this.checkPermission(payload.workspaceId, user._id);
      const collection = await this.collectionReposistory.getCollectionRequest(
        payload.collectionId,
      );
      if (!collection) {
        throw new BadRequestException("Collection Not Found");
      }
      const index = await this.checkFolderExist(collection, payload.folderId);
      collection.items[index].name = payload.name;
      collection.items[index].description =
        payload.description ?? collection.items[index].description;
      const data = await this.collectionReposistory.updateCollectionRequest(
        payload.collectionId,
        collection,
      );
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteFolder(
    payload: DeleteFolderDto,
  ): Promise<UpdateResult<CollectionRequestItem>> {
    try {
      const user = await this.contextService.get("user");
      await this.checkPermission(payload.workspaceId, user._id);
      const collection = await this.collectionReposistory.getCollectionRequest(
        payload.collectionId,
      );
      if (!collection) {
        throw new BadRequestException("Collection Not Found");
      }
      const updatedCollectionItems = collection.items.filter(
        (item) => item.id !== payload.folderId,
      );
      const data = await this.collectionReposistory.updateCollectionItems(
        payload.collectionId,
        updatedCollectionItems,
      );
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async checkPermission(workspaceId: string, userid: ObjectId): Promise<void> {
    try {
      const workspace = await this.workspaceReposistory.get(workspaceId);
      const hasPermission = workspace.permissions.some((user) => {
        return user.id.toString() === userid.toString();
      });
      if (!hasPermission) {
        throw new UnauthorizedException(
          "You don't have access of this Workspace",
        );
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async checkFolderExist(
    collection: CollectionRequest,
    id: string,
  ): Promise<number> {
    for (let i = 0; i < collection.items.length; i++) {
      if (collection.items[i].id === id) {
        return i;
      }
    }
    throw new BadRequestException("Folder Doesn't Exist");
  }
}
