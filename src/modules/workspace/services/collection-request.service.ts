import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { collectionRepository } from "../repositories/collection.repository";
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { ObjectId, WithId } from "mongodb";
import { Collection } from "@src/modules/common/models/collection.model";
import { ContextService } from "@src/modules/common/services/context.service";
import { CollectionRequestDto } from "../payloads/collectionRequest.payload";
import { v4 as uuidv4 } from "uuid";
@Injectable()
export class CollectionRequestService {
  constructor(
    private readonly collectionReposistory: collectionRepository,
    private readonly workspaceReposistory: WorkspaceRepository,
    private readonly contextService: ContextService,
  ) {}

  async addRequest(addRequestDto: CollectionRequestDto) {
    const uuid = uuidv4();
    try {
      const user = await this.contextService.get("user");
      await this.checkPermission(addRequestDto.workspaceId, user._id);
      const collectionRequests =
        await this.collectionReposistory.getCollectionRequest(
          addRequestDto.collectionId,
        );
      addRequestDto.collectionDto[0].id = uuid;
      // const updatedCollectionRequests = [collectionRequests];
      collectionRequests.items.push(addRequestDto.collectionDto[0]);
      collectionRequests.totalRequests = collectionRequests.totalRequests + 1;
      const data = await this.collectionReposistory.updateCollectionRequest(
        addRequestDto.collectionId,
        collectionRequests,
      );
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getCollection(id: string): Promise<WithId<Collection>> {
    try {
      return await this.collectionReposistory.get(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async checkPermission(workspaceId: string, userid: ObjectId): Promise<void> {
    try {
      const workspace = await this.workspaceReposistory.get(workspaceId);
      const hasPermission = workspace.permissions.some((user) => {
        return user.id.toString() === userid.toString();
      });
      if (!hasPermission) {
        throw new UnauthorizedException(
          "You don't have access of this Workspace",
        );
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
