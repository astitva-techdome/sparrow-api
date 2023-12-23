import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { Db, InsertOneResult, ObjectId, WithId } from "mongodb";

import { Environment } from "@src/modules/common/models/environment.model";
import { Collections } from "@src/modules/common/enum/database.collection.enum";

@Injectable()
export class EnvironmentRepository {
  constructor(@Inject("DATABASE_CONNECTION") private db: Db) {}

  async addEnvironment(environment: Environment): Promise<InsertOneResult> {
    const response = await this.db
      .collection<Environment>(Collections.ENVIRONMENT)
      .insertOne(environment);
    return response;
  }

  async get(id: string): Promise<WithId<Environment>> {
    const _id = new ObjectId(id);
    const data = await this.db
      .collection<Environment>(Collections.ENVIRONMENT)
      .findOne({ _id });
    if (!data) {
      throw new BadRequestException("Environment Not Found");
    }
    return data;
  }
}
