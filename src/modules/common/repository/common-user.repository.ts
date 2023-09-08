import { Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Collections } from "../enum/database.collection.enum";
import { UserDto } from "@src/modules/user/payload/user.payload";

export interface IGenericMessageBody {
  message: string;
}

/**
 * Common User Repository
 */
@Injectable()
export class CommonUserRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
  ) {}

  async findUserByUserId(id: ObjectId) {
    const userData = await this.db
      .collection(Collections.USER)
      .findOne({ _id: id });
    return userData;
  }

  async updateUserById(id: ObjectId, updateParams: UserDto) {
    const updatedUserParams = {
      $set: updateParams,
    };
    const responseData = await this.db
      .collection(Collections.USER)
      .findOneAndUpdate({ _id: id }, updatedUserParams);
    return responseData;
  }
}
