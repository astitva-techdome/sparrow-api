import { BadRequestException, Injectable } from "@nestjs/common";
import { UpdateUserDto } from "../payloads/user.payload";
import { UserRepository } from "../repositories/user.repository";
import { RegisterPayload } from "../payloads/register.payload";
import { ConfigService } from "@nestjs/config";
import { WorkspaceType } from "@src/modules/common/models/workspace.model";
import { AuthService } from "./auth.service";
import { AzureBusService } from "@src/modules/common/services/azureBus/azure-bus.service";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
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
  async getUserById(id: string) {
    const data = await this.userRepository.getUserById(id);
    if (!data) {
      throw new BadRequestException("User not found");
    }
    return new ApiResponseService("Success", HttpStatusCode.OK, data);
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
    const createdUser = await this.userRepository.createUser(payload);
    const data: any = await this.authService.createToken(
      createdUser.insertedId,
    );
    const workspaceObj = {
      name: this.configService.get("app.defaultWorkspaceName"),
      type: WorkspaceType.PERSONAL,
    };
    await this.azureBusService.sendMessage(
      TOPIC.USER_CREATED_TOPIC,
      workspaceObj,
    );
    return new ApiResponseService("User Created", HttpStatusCode.CREATED, data);
  }

  /**
   * Edit User data
   * @param {userId} payload
   * @param {UpdateUserDto} payload
   * @returns {Promise<IUser>} mutated User data
   */
  async updateUser(userId: string, payload: UpdateUserDto) {
    const data = await this.userRepository.updateUser(userId, payload);
    return new ApiResponseService("User Updated", HttpStatusCode.OK, data);
  }

  /**
   * Delete user given a email
   * @param {userId} param
   * @returns {Promise<IGenericMessageBody>}
   */
  async deleteUser(userId: string) {
    const data: any = await this.userRepository.deleteUser(userId);
    return new ApiResponseService("User Deleted", HttpStatusCode.OK, data);
  }
}
