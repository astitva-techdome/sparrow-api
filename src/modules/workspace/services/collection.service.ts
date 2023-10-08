import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from "../payloads/collection.payload";
import { collectionRepository } from "../repositories/collection.repository";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import {
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
  WithId,
} from "mongodb";
import { Collection } from "@src/modules/common/models/collection.model";
import { ContextService } from "@src/modules/common/services/context.service";

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionReposistory: collectionRepository,
    private readonly workspaceReposistory: WorkspaceRepository,
    private readonly contextService: ContextService,
  ) {}

  async createCollection(
    createCollectionDto: CreateCollectionDto,
  ): Promise<InsertOneResult> {
    try {
      const user = await this.contextService.get("user");
      await this.checkPermission(createCollectionDto.workspaceId, user._id);
      const collection = await this.collectionReposistory.addCollection(
        createCollectionDto,
      );
      return collection;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getCollection(id: string): Promise<WithId<Collection>> {
    try {
      return await this.collectionReposistory.get(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllCollections(id: string): Promise<WithId<Collection>[]> {
    try {
      const user = await this.contextService.get("user");
      await this.checkPermission(id, user._id);

      const workspace = await this.workspaceReposistory.get(id);
      const collections = [];
      for (let i = 0; i < workspace.collection?.length; i++) {
        const collection = await this.collectionReposistory.get(
          workspace.collection[i].id.toString(),
        );
        collections.push(collection);
      }
      return collections;
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
        throw new UnauthorizedException("UNAUTHORIZED");
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async updateCollection(
    collectionId: string,
    updateCollectionDto: UpdateCollectionDto,
    workspaceId: string,
  ): Promise<UpdateResult> {
    try {
      const user = await this.contextService.get("user");
      await this.checkPermission(workspaceId, user._id);
      await this.collectionReposistory.get(collectionId);
      const data = await this.collectionReposistory.update(
        collectionId,
        updateCollectionDto,
      );
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteCollection(
    id: string,
    workspaceId: string,
  ): Promise<DeleteResult> {
    try {
      const user = await this.contextService.get("user");
      await this.checkPermission(workspaceId, user._id);
      const data = await this.collectionReposistory.delete(id);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
