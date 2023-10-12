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
import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from "../payloads/collection.payload";
import { FastifyReply } from "fastify";
import { CollectionService } from "../services/collection.service";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
import { WorkspaceService } from "../services/workspace.service";
import { AuthGuard } from "@nestjs/passport";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
import {
  CollectionRequestItem,
  FolderPayload,
} from "../payloads/collectionRequest.payload";
import { CollectionRequestService } from "../services/collection-request.service";

@ApiBearerAuth()
@ApiTags("collection")
@Controller("api/collection")
@UseGuards(AuthGuard("jwt"), BlacklistGuard)
export class collectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly workSpaceService: WorkspaceService,
    private readonly collectionRequestService: CollectionRequestService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: "Collection Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Collection Failed" })
  async createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const workspaceId = createCollectionDto.workspaceId;
      const collection = await this.collectionService.createCollection(
        createCollectionDto,
      );

      await this.workSpaceService.addCollectionInWorkSpace(workspaceId, {
        id: collection.insertedId,
        name: createCollectionDto.name,
      });
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

  @Put(":collectionId/workspace/:workspaceId")
  @ApiResponse({ status: 200, description: "Collection Updated Successfully" })
  @ApiResponse({ status: 400, description: "Update Collection Failed" })
  async updateCollection(
    @Param("collectionId") collectionId: string,
    @Param("workspaceId") workspaceId: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Res() res: FastifyReply,
  ) {
    const collection = await this.collectionService.updateCollection(
      collectionId,
      updateCollectionDto,
      workspaceId,
    );
    await this.workSpaceService.updateCollectionInWorkSpace(
      workspaceId,
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
  @Delete(":collectionId/workspace/:workspaceId")
  @ApiResponse({ status: 201, description: "Removed Collection Successfully" })
  @ApiResponse({ status: 400, description: "Failed to remove Collection" })
  async deleteCollection(
    @Param("collectionId") collectionId: string,
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const collection = await this.collectionService.deleteCollection(
        collectionId,
        workspaceId,
      );

      await this.workSpaceService.deleteCollectionInWorkSpace(
        workspaceId.toString(),
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

  @Post(":collectionId/workspace/:workspaceId/request")
  @ApiResponse({ status: 200, description: "Request saved Successfully" })
  @ApiResponse({ status: 400, description: "Failed to save request" })
  async addRequest(
    @Param("collectionId") collectionId: string,
    @Param("workspaceId") workspaceId: string,
    @Body() collectionDto: CollectionRequestItem[],
    @Res() res: FastifyReply,
  ) {
    const collection = await this.collectionRequestService.addRequest({
      collectionId,
      workspaceId,
      collectionDto,
    });
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.OK,
      collection,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Post(":collectionId/workspace/:workspaceId/folder")
  @ApiResponse({ status: 200, description: "Request saved Successfully" })
  @ApiResponse({ status: 400, description: "Failed to save request" })
  async addFolder(
    @Param("collectionId") collectionId: string,
    @Param("workspaceId") workspaceId: string,
    @Body() body: FolderPayload,
    @Res() res: FastifyReply,
  ) {
    const response = await this.collectionRequestService.addFolder({
      collectionId,
      workspaceId,
      ...body,
    });
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.CREATED,
      response,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Put(":collectionId/workspace/:workspaceId/folder/:folderId")
  @ApiResponse({ status: 200, description: "Request saved Successfully" })
  @ApiResponse({ status: 400, description: "Failed to save request" })
  async updateFolder(
    @Param("collectionId") collectionId: string,
    @Param("workspaceId") workspaceId: string,
    @Param("folderId") folderId: string,
    @Body() body: FolderPayload,
    @Res() res: FastifyReply,
  ) {
    const response = await this.collectionRequestService.updateFolder({
      collectionId,
      workspaceId,
      folderId,
      ...body,
    });
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.OK,
      response,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Delete(":collectionId/workspace/:workspaceId/folder/:folderId")
  @ApiResponse({ status: 200, description: "Request saved Successfully" })
  @ApiResponse({ status: 400, description: "Failed to save request" })
  async deleteFolder(
    @Param("collectionId") collectionId: string,
    @Param("workspaceId") workspaceId: string,
    @Param("folderId") folderId: string,
    @Res() res: FastifyReply,
  ) {
    const response = await this.collectionRequestService.deleteFolder({
      collectionId,
      workspaceId,
      folderId,
    });
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.OK,
      response,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }
}
