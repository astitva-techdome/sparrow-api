import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Collections } from "@src/modules/common/enum/database.collection.enum";
import { createHmac } from "crypto";
import { RegisterPayload } from "../payloads/register.payload";
import { UpdateUserDto, UserDto } from "../payloads/user.payload";
import { User } from "@src/modules/common/models/user.model";
import { ContextService } from "@src/modules/common/services/context.service";

export interface IGenericMessageBody {
  message: string;
}

/**
 * User Repository
 */
@Injectable()
export class UserRepository {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private readonly contextService: ContextService,
  ) {}

  /**
   * Fetches a user from database by UUID
   * @param {string} id
   * @returns {Promise<IUser>} queried user data
   */
  async getUserById(id: string) {
    const authUser = this.contextService.get("user");
    if (authUser._id.toString() === id) {
      return authUser;
    }
    const _id = new ObjectId(id);
    return await this.db
      .collection(Collections.USER)
      .findOne({ _id }, { projection: { password: 0 } });
  }

  /**
   * Fetches a user from database by username
   * @param {string} email
   * @returns {Promise<IUser>} queried user data
   */
  async getUserByEmail(email: string) {
    return await this.db
      .collection(Collections.USER)
      .findOne({ email }, { projection: { password: 0 } });
  }

  /**
   * Fetches a user by their email and hashed password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<IUser>} queried user data
   */
  async getUserByEmailAndPass(email: string, password: string) {
    return await this.db.collection<User>(Collections.USER).findOne({
      email,
      password: createHmac("sha256", password).digest("hex"),
    });
  }

  /**
   * Create a user with RegisterPayload fields
   * @param {RegisterPayload} payload user payload
   * @returns {Promise<IUser>} created user data
   */
  async createUser(payload: RegisterPayload) {
    const createdUser = await this.db
      .collection<User>(Collections.USER)
      .insertOne({
        ...payload,
        password: createHmac("sha256", payload.password).digest("hex"),
        teams: [],
      });

    return createdUser;
  }

  /**
   * Edit User data
   * @param {userId} payload
   * @param {UpdateUserDto} payload
   * @returns {Promise<IUser>} mutated User data
   */
  async updateUser(userId: string, payload: UpdateUserDto) {
    const _id = new ObjectId(userId);
    if (payload.password) {
      payload.password = createHmac("sha256", payload.password).digest("hex");
    }
    const updatedUser = await this.db
      .collection<User>(Collections.USER)
      .updateOne({ _id }, { $set: payload });
    if (!updatedUser.matchedCount) {
      throw new BadRequestException(
        "The user with that email does not exist in the system. Please try another username.",
      );
    }
    return this.getUserById(userId);
  }

  /**
   * Delete user given a email
   * @param {userId} param
   * @returns {Promise<IGenericMessageBody>}
   */
  async deleteUser(userId: string): Promise<IGenericMessageBody> {
    const _id = new ObjectId(userId);
    return this.db
      .collection<User>(Collections.USER)
      .deleteOne({ _id })
      .then((user) => {
        if (user.deletedCount === 1) {
          return { message: `Deleted ${userId} from records` };
        } else {
          throw new BadRequestException(
            `Failed to delete a user by the id of ${userId}.`,
          );
        }
      });
  }

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
