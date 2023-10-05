import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { CreateCollectionDto } from "../payloads/collection.payload";
import { Db, ObjectId } from "mongodb";
import { Collections } from "@src/modules/common/enum/database.collection.enum";
import { ContextService } from "@src/modules/common/services/context.service";

@Injectable()
export class collectionRepository {
  constructor(
    @Inject("DATABASE_CONNECTION") private db: Db,
    private readonly contextService: ContextService,
  ) {}
  async addCollection(createCollectionDto: CreateCollectionDto) {
    const response = await this.db
      .collection(Collections.Collection)
      .insertOne(createCollectionDto);
    return response;
  }

  async get(id: string) {
    const _id = new ObjectId(id);
    const data = await this.db
      .collection(Collections.Collection)
      .findOne({ _id });
    if (!data) {
      throw new BadRequestException("Collection Not Found");
    }
    return data;
  }
  async getAllCollection(workspaceId: string) {
    const _id = new ObjectId(workspaceId);
    const data = await this.db.collection(Collections.WORKSPACE).find({ _id });
    if (!data) {
      throw new BadRequestException("Not Found");
    }
    return data;
  }
  async update(id: string, updateCollectionDto: CreateCollectionDto) {
    const collectionId = new ObjectId(id);
    const defaultParams = {
      updatedAt: new Date(),
      updatedBy: this.contextService.get("user")._id,
    };
    return this.db
      .collection(Collections.Collection)
      .updateOne(
        { _id: collectionId },
        { $set: { ...updateCollectionDto, ...defaultParams } },
      );
  }
  async delete(id: string) {
    const _id = new ObjectId(id);
    return this.db.collection(Collections.Collection).deleteOne({ _id });
  }
}
