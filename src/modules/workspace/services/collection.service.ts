import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { CreateCollectionDto } from "../payloads/collection.payload";
import { collectionRepository } from "../repositories/collection.repository";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { ObjectId } from "mongodb";

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionReposistory: collectionRepository,
    private readonly workspaceReposistory: WorkspaceRepository,
  ) {}

  async createCollection(createCollectionDto: CreateCollectionDto) {
    try {
      const collection = await this.collectionReposistory.addCollection(
        createCollectionDto,
      );
      return collection;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getCollection(id: string) {
    return await this.collectionReposistory.get(id);
  }

  async getAllCollections(id: string) {
    try {
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

  async checkPermission(workspaceId: string, userid: ObjectId) {
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
    updateCollectionDto: CreateCollectionDto,
  ) {
    try {
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

  async deleteCollection(id: string) {
    try {
      await this.collectionReposistory.get(id);
      const data = await this.collectionReposistory.delete(id);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
