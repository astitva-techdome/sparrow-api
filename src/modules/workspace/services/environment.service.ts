import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { DeleteResult, InsertOneResult, ObjectId, WithId } from "mongodb";
import { ContextService } from "@src/modules/common/services/context.service";
import { CreateEnvironmentDto } from "../payloads/environment.payload";
import {
  Environment,
  EnvironmentType,
} from "@src/modules/common/models/environment.model";
import { EnvironmentRepository } from "../repositories/environment.repository";
import { ErrorMessages } from "@src/modules/common/enum/error-messages.enum";
import { WorkspaceRepository } from "../repositories/workspace.repository";

@Injectable()
export class EnvironmentService {
  constructor(
    private readonly environmentRepository: EnvironmentRepository,
    private readonly workspaceReposistory: WorkspaceRepository,
    private readonly contextService: ContextService,
  ) {}

  async createEnvironment(
    createEnvironmentDto: CreateEnvironmentDto,
    type: EnvironmentType,
  ): Promise<InsertOneResult> {
    try {
      const user = this.contextService.get("user");

      if (type === EnvironmentType.LOCAL) {
        await this.checkPermission(createEnvironmentDto.workspaceId, user._id);
      }

      const newEnvironment: Environment = {
        name: createEnvironmentDto.name,
        variable: createEnvironmentDto.variable,
        type,
        createdBy: user.name,
        updatedBy: user.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const environment = await this.environmentRepository.addEnvironment(
        newEnvironment,
      );
      return environment;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getEnvironment(id: string): Promise<WithId<Environment>> {
    return await this.environmentRepository.get(id);
  }

  async checkPermission(workspaceId: string, userid: ObjectId): Promise<void> {
    const workspace = await this.workspaceReposistory.get(workspaceId);
    const hasPermission = workspace.permissions.some((user) => {
      return user.id.toString() === userid.toString();
    });
    if (!hasPermission) {
      throw new UnauthorizedException(ErrorMessages.Unauthorized);
    }
  }

  async deleteEnvironment(
    id: string,
    workspaceId: string,
  ): Promise<DeleteResult> {
    const user = this.contextService.get("user");
    await this.checkPermission(workspaceId, user._id);
    const data = await this.environmentRepository.delete(id);
    return data;
  }

  async getAllEnvironments(id: string): Promise<WithId<Environment>[]> {
    const user = this.contextService.get("user");
    await this.checkPermission(id, user._id);

    const workspace = await this.workspaceReposistory.get(id);
    const environments = [];
    for (let i = 0; i < workspace.environments?.length; i++) {
      const environment = await this.environmentRepository.get(
        workspace.environments[i].id.toString(),
      );
      environments.push(environment);
    }
    return environments;
  }
}
