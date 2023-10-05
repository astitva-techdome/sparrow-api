import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateCollectionDto } from "../payloads/collection.payload";
import { FastifyReply } from "fastify";
import { CollectionService } from "../services/collection.service";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
import { WorkspaceService } from "../services/workspace.service";
import { ContextService } from "@src/modules/common/services/context.service";
import { AuthGuard } from "@nestjs/passport";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
@ApiBearerAuth()
@ApiTags("collection")
@Controller("api/collection")
@UseGuards(AuthGuard("jwt"), BlacklistGuard)
export class collectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly workSpaceService: WorkspaceService,
    private readonly contextService: ContextService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: "Collection Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Collection Failed" })
  async createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const user = await this.contextService.get("user");
      await this.collectionService.checkPermission(
        createCollectionDto.workspaceId,
        user._id,
      );
      const collection = await this.collectionService.createCollection(
        createCollectionDto,
      );

      await this.workSpaceService.addCollectionInWorkSpace(
        createCollectionDto.workspaceId,
        {
          id: collection.insertedId,
          name: createCollectionDto.name,
        },
      );
      const responseData = new ApiResponseService(
        "Collection Created",
        HttpStatusCode.CREATED,
        collection,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(":workspaceId")
  @ApiResponse({
    status: 200,
    description: "Fetch Collection Request Received",
  })
  @ApiResponse({ status: 400, description: "Fetch Collection Request Failed" })
  async getCollection(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const user = await this.contextService.get("user");
      await this.collectionService.checkPermission(workspaceId, user._id);
      const collection = await this.collectionService.getAllCollections(
        workspaceId,
      );
      const responseData = new ApiResponseService(
        "Success",
        HttpStatusCode.OK,
        collection,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put(":collectionId")
  @ApiResponse({ status: 200, description: "Collection Updated Successfully" })
  @ApiResponse({ status: 400, description: "Update Collection Failed" })
  async updateCollection(
    @Param("collectionId") collectionId: string,
    @Body() updateCollectionDto: CreateCollectionDto,
    @Res() res: FastifyReply,
  ) {
    const user = await this.contextService.get("user");
    await this.collectionService.checkPermission(
      updateCollectionDto.workspaceId,
      user._id,
    );
    const collection = await this.collectionService.updateCollection(
      collectionId,
      updateCollectionDto,
    );
    await this.workSpaceService.updateCollectionInWorkSpace(
      updateCollectionDto.workspaceId,
      collectionId,
      updateCollectionDto.name,
    );
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.OK,
      collection,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }
  @Delete(":collectionId")
  @ApiResponse({ status: 201, description: "Removed Collection Successfully" })
  @ApiResponse({ status: 400, description: "Failed to remove Collection" })
  async deleteCollection(
    @Param("collectionId") collectionId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const user = await this.contextService.get("user");
      const existingCollection = await this.collectionService.getCollection(
        collectionId,
      );
      await this.collectionService.checkPermission(
        existingCollection.workspaceId,
        user._id,
      );
      const collection = await this.collectionService.deleteCollection(
        collectionId,
      );

      await this.workSpaceService.deleteCollectionInWorkSpace(
        existingCollection.workspaceId,
        collectionId,
      );
      const responseData = new ApiResponseService(
        "Collection Removed",
        HttpStatusCode.OK,
        collection,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
