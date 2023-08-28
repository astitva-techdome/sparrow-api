import {
  BadRequestException,
  Inject,
  Injectable,
  NotAcceptableException,
} from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Collections } from "../common/enum/database.collection.enum";
import { createHmac } from "crypto";
import { RegisterPayload } from "../auth/payload/register.payload";
import { UpdateUserDto } from "./payload/user.payload";

export interface IGenericMessageBody {
  message: string;
}

/**
 * User Service
 */
@Injectable()
export class UserService {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
  ) {}

  /**
   * Fetches a user from database by UUID
   * @param {string} id
   * @returns {Promise<IUser>} queried user data
   */
  getUserById(id: string) {
    const _id = new ObjectId(id);
    return this.db.collection(Collections.USER).findOne({ _id });
  }

  /**
   * Fetches a user from database by username
   * @param {string} email
   * @returns {Promise<IUser>} queried user data
   */
  async getUserByEmail(email: string) {
    return await this.db.collection(Collections.USER).findOne({ email });
  }

  /**
   * Fetches a user by their email and hashed password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<IUser>} queried user data
   */
  async getUserByEmailAndPass(email: string, password: string) {
    return await this.db.collection(Collections.USER).findOne({
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
    const user = await this.getUserByEmail(payload.email);
    if (user) {
      throw new NotAcceptableException(
        "The account with the provided email currently exists. Please choose another one.",
      );
    }
    const createdUser = await this.db.collection(Collections.USER).insertOne({
      ...payload,
      password: createHmac("sha256", payload.password).digest("hex"),
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
      .collection(Collections.USER)
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
  deleteUser(userId: string): Promise<IGenericMessageBody> {
    const _id = new ObjectId(userId);
    return this.db
      .collection(Collections.USER)
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
}
