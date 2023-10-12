import { BadRequestException, Injectable } from "@nestjs/common";
import { UpdateUserDto } from "../payloads/user.payload";
import { UserRepository } from "../repositories/user.repository";
import { RegisterPayload } from "../payloads/register.payload";
import { ConfigService } from "@nestjs/config";
import { WorkspaceType } from "@src/modules/common/models/workspace.model";
import { AuthService } from "./auth.service";
import { AzureBusService } from "@src/modules/common/services/azureBus/azure-bus.service";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { User } from "@src/modules/common/models/user.model";
import { ObjectId, WithId } from "mongodb";
import * as argon2 from "argon2";
export interface IGenericMessageBody {
  message: string;
}
/**
 * User Service
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly azureBusService: AzureBusService,
  ) {}

  /**
   * Fetches a user from database by UUID
   * @param {string} id
   * @returns {Promise<IUser>} queried user data
   */
  async getUserById(id: string): Promise<WithId<User>> {
    try {
      const data = await this.userRepository.getUserById(id);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Fetches a user from database by username
   * @param {string} email
   * @returns {Promise<IUser>} queried user data
   */
  async getUserByEmail(email: string) {
    return await this.userRepository.getUserByEmail(email);
  }

  /**
   * Fetches a user by their email and hashed password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<IUser>} queried user data
   */
  async getUserByEmailAndPass(email: string, password: string) {
    return await this.userRepository.getUserByEmailAndPass(email, password);
  }

  /**
   * Create a user with RegisterPayload fields
   * @param {RegisterPayload} payload user payload
   * @returns {Promise<IUser>} created user data
   */
  async createUser(payload: RegisterPayload) {
    const user = await this.getUserByEmail(payload.email);
    if (user) {
      throw new BadRequestException(
        "The account with the provided email currently exists. Please choose another one.",
      );
    }
    try {
      const createdUser = await this.userRepository.createUser(payload);
      const accessToken = await this.authService.createToken(
        createdUser.insertedId,
      );
      const refreshToken = await this.authService.createRefreshToken(
        createdUser.insertedId,
      );
      const data = {
        accessToken,
        refreshToken,
      };
      const workspaceObj = {
        name: this.configService.get("app.defaultWorkspaceName"),
        type: WorkspaceType.PERSONAL,
      };
      await this.azureBusService.sendMessage(
        TOPIC.USER_CREATED_TOPIC,
        workspaceObj,
      );
      const hashedRefreshToken = await this.authService.hashData(
        refreshToken.token,
      );
      await this.userRepository.addRefreshTokenInUser(
        createdUser.insertedId,
        hashedRefreshToken,
      );
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Edit User data
   * @param {userId} payload
   * @param {UpdateUserDto} payload
   * @returns {Promise<IUser>} mutated User data
   */
  async updateUser(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<WithId<User>> {
    try {
      const data = await this.userRepository.updateUser(userId, payload);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Delete user given a email
   * @param {userId} param
   * @returns {Promise<IGenericMessageBody>}
   */
  async deleteUser(userId: string) {
    try {
      const data: any = await this.userRepository.deleteUser(userId);
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async logoutUser(userId: string, refreshToken: string) {
    try {
      const user = await this.userRepository.findUserByUserId(
        new ObjectId(userId),
      );
      const hashrefreshToken = user.refresh_tokens.filter(async (token) => {
        if (await argon2.verify(token, refreshToken)) {
          return token;
        }
      });
      if (!hashrefreshToken) {
        throw new BadRequestException();
      }
      await this.userRepository.deleteRefreshToken(userId, hashrefreshToken[0]);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
