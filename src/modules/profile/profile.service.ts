import {
  BadRequestException,
  Inject,
  Injectable,
  NotAcceptableException,
} from "@nestjs/common";
import { Db } from "mongodb";
import { createHmac } from "crypto";
import { url } from "gravatar";
import { AppRoles } from "modules/app/app.roles";
import { RegisterPayload } from "modules/auth/payload/register.payload";
import { PatchProfilePayload } from "./payload/patch.profile.payload";
/**
 * Models a typical response for a crud operation
 */
export interface IGenericMessageBody {
  /**
   * Status message to return
   */
  message: string;
}

/**
 * Profile Service
 */
@Injectable()
export class ProfileService {
  constructor(
    @Inject("DATABASE_CONNECTION")
    private db: Db,
  ) {}

  /**
   * Fetches a profile from database by UUID
   * @param {string} id
   * @returns {Promise<IProfile>} queried profile data
   */
  get(id: string) {
    return this.db.collection("profile").findOne({ id });
  }

  /**
   * Fetches a profile from database by username
   * @param {string} username
   * @returns {Promise<IProfile>} queried profile data
   */
  async getByUsername(username: string) {
    return await this.db.collection("profile").findOne({ username });
  }

  /**
   * Fetches a profile by their username and hashed password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<IProfile>} queried profile data
   */
  async getByUsernameAndPass(username: string, password: string) {
    return await this.db.collection("profile").findOne({
      username,
      password: createHmac("sha256", password).digest("hex"),
    });
  }

  /**
   * Create a profile with RegisterPayload fields
   * @param {RegisterPayload} payload profile payload
   * @returns {Promise<IProfile>} created profile data
   */
  async create(payload: RegisterPayload) {
    const user = await this.getByUsername(payload.username);
    if (user) {
      throw new NotAcceptableException(
        "The account with the provided username currently exists. Please choose another one.",
      );
    }
    // this will auto assign the admin role to each created user
    const createdProfile = await this.db.collection("profile").insertOne({
      ...payload,
      password: createHmac("sha256", payload.password).digest("hex"),
      avatar: url(payload.email, {
        protocol: "http",
        s: "200",
        r: "pg",
        d: "404",
      }),
      roles: AppRoles.ADMIN,
    });

    return createdProfile;
  }

  /**
   * Edit profile data
   * @param {PatchProfilePayload} payload
   * @returns {Promise<IProfile>} mutated profile data
   */
  async edit(payload: PatchProfilePayload) {
    const { username } = payload;
    if (payload.password) {
      payload.password = createHmac("sha256", payload.password).digest("hex");
    }
    const updatedProfile = await this.db
      .collection("profile")
      .updateOne({ username }, { $set: payload });
    if (!updatedProfile.matchedCount) {
      throw new BadRequestException(
        "The profile with that username does not exist in the system. Please try another username.",
      );
    }
    return this.getByUsername(username);
  }

  /**
   * Delete profile given a username
   * @param {string} username
   * @returns {Promise<IGenericMessageBody>} whether or not the crud operation was completed
   */
  delete(username: string): Promise<IGenericMessageBody> {
    return this.db
      .collection("profile")
      .deleteOne({ username })
      .then((profile) => {
        if (profile.deletedCount === 1) {
          return { message: `Deleted ${username} from records` };
        } else {
          throw new BadRequestException(
            `Failed to delete a profile by the name of ${username}.`,
          );
        }
      });
  }
}
