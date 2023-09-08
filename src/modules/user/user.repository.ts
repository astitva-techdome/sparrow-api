import {
  BadRequestException,
  Inject,
  Injectable,
  NotAcceptableException,
  forwardRef,
} from "@nestjs/common";
import { Db, ObjectId } from "mongodb";
import { Collections } from "../common/enum/database.collection.enum";
import { createHmac } from "crypto";
import { RegisterPayload } from "../auth/payload/register.payload";
import { UpdateUserDto, UserDto } from "./payload/user.payload";
import { WorkspaceService } from "../workspace/services/workspace.service";
import { CreateOrUpdateWorkspaceDto } from "../workspace/payload/workspace.payload";
import { ConfigService } from "@nestjs/config";
import { WorkspaceType } from "../common/models/workspace.model";
import { User } from "../common/models/user.model";
import { AuthService } from "@auth/auth.service";
import { ContextService } from "../common/services/context.service";

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
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
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
    const user = await this.getUserByEmail(payload.email);
    if (user) {
      throw new NotAcceptableException(
        "The account with the provided email currently exists. Please choose another one.",
      );
    }
    const createdUser = await this.db
      .collection<User>(Collections.USER)
      .insertOne({
        ...payload,
        password: createHmac("sha256", payload.password).digest("hex"),
        teams: [],
        permissions: [],
      });

    const token = await this.authService.createToken(createdUser.insertedId);

    const workspaceObj: CreateOrUpdateWorkspaceDto = {
      name: this.configService.get("app.defaultWorkspaceName"),
      type: WorkspaceType.PERSONAL,
    };

    await this.workspaceService.create(workspaceObj);

    return token;
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
