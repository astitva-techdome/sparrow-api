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
  CollectionRequestDto,
  DeleteFolderDto,
  FolderDto,
} from "../payloads/collectionRequest.payload";
import { v4 as uuidv4 } from "uuid";
import {
  Collection,
  CollectionItem,
  ItemTypeEnum,
  SourceTypeEnum,
} from "@src/modules/common/models/collection.model";
import { CollectionService } from "./collection.service";
@Injectable()
export class CollectionRequestService {
  constructor(
    private readonly collectionReposistory: collectionRepository,
    private readonly workspaceReposistory: WorkspaceRepository,
    private readonly contextService: ContextService,
    private readonly collectionService: CollectionService,
  ) {}

  async addFolder(payload: FolderDto): Promise<CollectionItem> {
    const user = await this.contextService.get("user");
    const uuid = uuidv4();
    await this.checkPermission(payload.workspaceId, user._id);
    const collection = await this.collectionReposistory.getCollection(
      payload.collectionId,
    );
    if (!collection) {
      throw new BadRequestException("Collection Not Found");
    }
    const updatedFolder: CollectionItem = {
      id: uuid,
      name: payload.name,
      description: payload.description ?? "",
      type: ItemTypeEnum.FOLDER,
      source: SourceTypeEnum.USER,
      isDeleted: false,
      items: [],
    };
    collection.items.push(updatedFolder);
    await this.collectionReposistory.updateCollection(
      payload.collectionId,
      collection,
    );
    return updatedFolder;
  }

  async updateFolder(payload: FolderDto): Promise<UpdateResult<Collection>> {
    const user = await this.contextService.get("user");
    await this.checkPermission(payload.workspaceId, user._id);
    const collection = await this.collectionReposistory.getCollection(
      payload.collectionId,
    );
    if (!collection) {
      throw new BadRequestException("Collection Not Found");
    }
    const index = await this.checkFolderExist(collection, payload.folderId);
    collection.items[index].name = payload.name;
    collection.items[index].description =
      payload.description ?? collection.items[index].description;
    const data = await this.collectionReposistory.updateCollection(
      payload.collectionId,
      collection,
    );
    return data;
  }

  async deleteFolder(
    payload: DeleteFolderDto,
  ): Promise<UpdateResult<Collection>> {
    const user = await this.contextService.get("user");
    await this.checkPermission(payload.workspaceId, user._id);
    const collection = await this.collectionReposistory.getCollection(
      payload.collectionId,
    );
    if (!collection) {
      throw new BadRequestException("Collection Not Found");
    }
    const updatedCollectionItems = collection.items.filter(
      (item) => item.id !== payload.folderId,
    );
    collection.items = updatedCollectionItems;
    const data = await this.collectionReposistory.updateCollection(
      payload.collectionId,
      collection,
    );
    return data;
  }

  async checkPermission(workspaceId: string, userid: ObjectId): Promise<void> {
    const workspace = await this.workspaceReposistory.get(workspaceId);
    const hasPermission = workspace.permissions.some((user) => {
      return user.id.toString() === userid.toString();
    });
    if (!hasPermission) {
      throw new UnauthorizedException(
        "You don't have access of this Workspace",
      );
    }
  }

  async checkFolderExist(collection: Collection, id: string): Promise<number> {
    for (let i = 0; i < collection.items.length; i++) {
      if (collection.items[i].id === id) {
        return i;
      }
    }
    throw new BadRequestException("Folder Doesn't Exist");
  }
  async addRequest(
    collectionId: string,
    request: CollectionRequestDto,
    noOfRequests: number,
    userName: string,
  ): Promise<UpdateResult<Collection>> {
    const uuid = uuidv4();
    const requestObj: CollectionItem = {
      id: uuid,
      name: request.items.name,
      type: request.items.type,
      description: request.items.description,
      source: SourceTypeEnum.USER,
      isDeleted: false,
    };
    const requestInfo = {
      createdBy: userName,
      updatedBy: userName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (request.items.type === ItemTypeEnum.REQUEST) {
      requestObj.request = { ...request.items.request, ...requestInfo };
      return await this.collectionReposistory.addRequest(
        collectionId,
        requestObj,
        noOfRequests,
      );
    } else {
      requestObj.items = [
        {
          id: uuidv4(),
          name: request.items.items.name,
          type: request.items.items.type,
          description: request.items.items.description,
          request: { ...request.items.items.request, ...requestInfo },
          source: SourceTypeEnum.USER,
        },
      ];

      const collection = await this.collectionReposistory.addRequestInFolder(
        collectionId,
        requestObj,
        noOfRequests,
      );
      return collection;
    }
  }

  async updateRequest(
    collectionId: string,
    requestId: string,
    request: CollectionRequestDto,
  ): Promise<UpdateResult<Collection>> {
    return await this.collectionReposistory.updateRequest(
      collectionId,
      requestId,
      request,
    );
  }

  async deleteRequest(
    collectionId: string,
    requestId: string,
    noOfRequests: number,
    folderId?: string,
  ): Promise<UpdateResult<Collection>> {
    return await this.collectionReposistory.deleteRequest(
      collectionId,
      requestId,
      noOfRequests,
      folderId,
    );
  }

  async getNoOfRequest(collectionId: string): Promise<number> {
    const data = await this.collectionReposistory.get(collectionId);
    let noOfRequests = 0;
    if (data.items.length > 0) {
      data.items.map((item) => {
        if (item.type === ItemTypeEnum.REQUEST) {
          noOfRequests = noOfRequests + 1;
        } else if (item.type === ItemTypeEnum.FOLDER) {
          noOfRequests = noOfRequests + item.items.length;
        }
      });
    }
    return noOfRequests;
  }
}
