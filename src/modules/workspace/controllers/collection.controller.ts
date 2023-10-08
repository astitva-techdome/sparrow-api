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
@ApiBearerAuth()
@ApiTags("collection")
@Controller("api/collection")
@UseGuards(AuthGuard("jwt"), BlacklistGuard)
export class collectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly workSpaceService: WorkspaceService,
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
}
