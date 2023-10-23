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
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";
import {
  CollectionRequestDto,
  FolderPayload,
} from "../payloads/collectionRequest.payload";
import { CollectionRequestService } from "../services/collection-request.service";
import { ContextService } from "@src/modules/common/services/context.service";
import { JwtAuthGuard } from "@src/modules/common/guards/jwt-auth.guard";

@ApiBearerAuth()
@ApiTags("collection")
@Controller("api/collection")
@UseGuards(JwtAuthGuard, BlacklistGuard)
export class collectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly workSpaceService: WorkspaceService,
    private readonly collectionRequestService: CollectionRequestService,
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

  @Post(":collectionId/workspace/:workspaceId/folder")
  @ApiResponse({ status: 200, description: "Request saved Successfully" })
  @ApiResponse({ status: 400, description: "Failed to save request" })
  async addFolder(
    @Param("collectionId") collectionId: string,
    @Param("workspaceId") workspaceId: string,
    @Body() body: FolderPayload,
    @Res() res: FastifyReply,
  ) {
    try {
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
    } catch (error) {
      throw new BadRequestException(error);
    }
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
    try {
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
    } catch (error) {
      throw new BadRequestException(error);
    }
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
    try {
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
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post("request")
  @ApiResponse({ status: 200, description: "Request Updated Successfully" })
  @ApiResponse({ status: 400, description: "Failed to Update a request" })
  async addRequest(
    @Body() requestDto: CollectionRequestDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const collectionId = requestDto.collectionId;
      const workspaceId = requestDto.workspaceId;
      const user = await this.contextService.get("user");
      await this.collectionRequestService.checkPermission(
        workspaceId,
        user._id,
      );
      const noOfRequests = await this.collectionRequestService.getNoOfRequest(
        collectionId,
      );
      const collection = await this.collectionRequestService.addRequest(
        collectionId,
        requestDto,
        noOfRequests,
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

  @Put("request/:requestId")
  @ApiResponse({ status: 200, description: "Request saved Successfully" })
  @ApiResponse({ status: 400, description: "Failed to save request" })
  async updateRequest(
    @Param("requestId") requestId: string,
    @Body() requestDto: CollectionRequestDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const collectionId = requestDto.collectionId;
      const workspaceId = requestDto.workspaceId;
      const user = await this.contextService.get("user");
      await this.collectionRequestService.checkPermission(
        workspaceId,
        user._id,
      );
      const collection = await this.collectionRequestService.updateRequest(
        collectionId,
        requestId,
        requestDto,
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

  @Delete("request/:requestId")
  @ApiResponse({ status: 200, description: "Request Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Failed to delete request" })
  async deleteRequest(
    @Param("requestId") requestId: string,
    @Body() requestDto: CollectionRequestDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const collectionId = requestDto.collectionId;
      const workspaceId = requestDto.workspaceId;
      const user = await this.contextService.get("user");
      await this.collectionRequestService.checkPermission(
        workspaceId,
        user._id,
      );
      const noOfRequests = await this.collectionRequestService.getNoOfRequest(
        collectionId,
      );
      const collection = await this.collectionRequestService.deleteRequest(
        collectionId,
        requestId,
        noOfRequests,
        requestDto.folderId,
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
}
