import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from "../payloads/collection.payload";
import {
  Db,
  DeleteResult,
  InsertOneResult,
  ObjectId,
  UpdateResult,
  WithId,
} from "mongodb";
import { Collections } from "@src/modules/common/enum/database.collection.enum";
import { ContextService } from "@src/modules/common/services/context.service";
import { Collection } from "@src/modules/common/models/collection.model";
import { CollectionRequestItem } from "../payloads/collectionRequest.payload";
@Injectable()
export class collectionRepository {
  constructor(
    @Inject("DATABASE_CONNECTION") private db: Db,
    private readonly contextService: ContextService,
  ) {}
  async addCollection(
    collection: CreateCollectionDto,
  ): Promise<InsertOneResult> {
    const user = await this.contextService.get("user");
    delete collection.workspaceId;

    const new_collection: Collection = {
      name: collection.name,
      totalRequests: 0,
      createdBy: user.name,
      items: [],
      updatedBy: user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const response = await this.db
      .collection<Collection>(Collections.COLLECTION)
      .insertOne(new_collection);
    return response;
  }

  async get(id: string): Promise<WithId<Collection>> {
    const _id = new ObjectId(id);
    const data = await this.db
      .collection<Collection>(Collections.COLLECTION)
      .findOne({ _id });
    if (!data) {
      throw new BadRequestException("Collection Not Found");
    }
    return data;
  }
  async update(
    id: string,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<UpdateResult> {
    const collectionId = new ObjectId(id);
    const defaultParams = {
      updatedAt: new Date(),
      updatedBy: this.contextService.get("user")._id,
    };
    const data = await this.db
      .collection(Collections.COLLECTION)
      .updateOne(
        { _id: collectionId },
        { $set: { ...updateCollectionDto, ...defaultParams } },
      );
    return data;
  }
  async delete(id: string): Promise<DeleteResult> {
    const _id = new ObjectId(id);
    const data = await this.db
      .collection(Collections.COLLECTION)
      .deleteOne({ _id });
    return data;
  }

  async getCollectionRequest(id: string): Promise<CollectionRequestItem> {
    const _id = new ObjectId(id);
    const data = await this.db
      .collection<CollectionRequestItem>(Collections.COLLECTION)
      .findOne({ _id }, { projection: { items: 1 } });
    return data;
  }

  async updateCollectionRequest(id: string, payload: any) {
    const _id = new ObjectId(id);
    const data = await this.db.collection(Collections.COLLECTION).updateOne(
      { _id: _id },
      {
        $set: {
          items: payload,
        },
      },
    );

    return data;
  }
}
