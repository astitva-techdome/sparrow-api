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
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { WorkspaceService } from "../services/workspace.service";
import { CreateOrUpdateWorkspaceDto } from "../payloads/workspace.payload";
import { BlacklistGuard } from "../../common/guards/blacklist.guard";
import { PermissionService } from "../services/permission.service";
import { AddWorkspaceUserDto } from "../payloads/workspaceUser.payload";
import { FastifyReply } from "fastify";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
import {
  FileInterceptor,
  UploadedFile,
  MemoryStorageFile,
} from "@blazity/nest-file-fastify";
import * as yml from "js-yaml";
import { ParserService } from "@src/modules/common/services/parser.service";
import { CollectionService } from "../services/collection.service";
import axios from "axios";
import { ImportCollectionDto } from "../payloads/collection.payload";
import { JwtAuthGuard } from "@src/modules/common/guards/jwt-auth.guard";

/**
 * Workspace Controller
 */
@ApiBearerAuth()
@ApiTags("workspace")
@Controller("api/workspace")
@UseGuards(JwtAuthGuard, BlacklistGuard)
export class WorkSpaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly permissionService: PermissionService,
    private readonly parserService: ParserService,
    private readonly collectionService: CollectionService,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: "Workspace Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Workspace Failed" })
  async createWorkspace(
    @Body() createWorkspaceDto: CreateOrUpdateWorkspaceDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const data = await this.workspaceService.create(createWorkspaceDto);
      const responseData = new ApiResponseService(
        "Workspace Created",
        HttpStatusCode.CREATED,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(":workspaceId")
  @ApiResponse({ status: 200, description: "Fetch Workspace Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Workspace Request Failed" })
  async getWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const data = await this.workspaceService.get(workspaceId);
      const responseData = new ApiResponseService(
        "Success",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  @Get("user/:userId")
  @ApiResponse({
    status: 200,
    description: "All Workspace Of User Received Successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Fetching All User Workspaces Request Failed",
  })
  async getAllWorkspaces(
    @Param("userId") userId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const data = await this.workspaceService.getAllWorkSpaces(userId);
      const responseData = new ApiResponseService(
        "Success",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  @Put(":workspaceId")
  @ApiResponse({ status: 200, description: "Workspace Updated Successfully" })
  @ApiResponse({ status: 400, description: "Update Workspace Failed" })
  async updateWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Body() updateWorkspaceDto: CreateOrUpdateWorkspaceDto,
    @Res() res: FastifyReply,
  ) {
    try {
      const data = await this.workspaceService.update(
        workspaceId,
        updateWorkspaceDto,
      );
      const responseData = new ApiResponseService(
        "Workspace Updated",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete(":workspaceId")
  @ApiResponse({ status: 200, description: "Workspace Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Workspace Failed" })
  async deleteWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const data = await this.workspaceService.delete(workspaceId);
      const responseData = new ApiResponseService(
        "Workspace Deleted",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post(":workspaceId/user/:userId")
  @ApiResponse({ status: 201, description: "User Added Successfully" })
  @ApiResponse({ status: 400, description: "Failed to Add User" })
  async addUserWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Param("userId") userId: string,
    @Body() data: AddWorkspaceUserDto,
    @Res() res: FastifyReply,
  ) {
    const params = {
      userId: userId,
      workspaceId: workspaceId,
      role: data.role,
    };
    try {
      const response = await this.permissionService.create(params);
      const responseData = new ApiResponseService(
        "User Added",
        HttpStatusCode.OK,
        response,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete(":workspaceId/user/:userId")
  @ApiResponse({ status: 201, description: "Removed User Successfully" })
  @ApiResponse({ status: 400, description: "Failed to remove user" })
  async removerUserWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Param("userId") userId: string,
    @Res() res: FastifyReply,
  ) {
    const params = {
      userId: userId,
      workspaceId: workspaceId,
    };
    try {
      const data =
        await this.permissionService.removeSinglePermissionInWorkspace(params);
      const responseData = new ApiResponseService(
        "User Removed",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post(":workspaceId/importFile/collection")
  @UseInterceptors(FileInterceptor("file"))
  @ApiResponse({ status: 201, description: "Collection Import Successfull" })
  @ApiResponse({ status: 400, description: "Failed to Import  Collection" })
  async importCollection(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
    @UploadedFile()
    file: MemoryStorageFile,
  ) {
    try {
      const dataBuffer = file.buffer;
      const dataString = dataBuffer.toString("utf8");
      const dataObj =
        file.mimetype === "application/json"
          ? JSON.parse(dataString)
          : yml.load(dataString);

      const collectionObj = await this.parserService.parse(dataObj);
      const collection = await this.collectionService.importCollection(
        collectionObj,
      );
      await this.workspaceService.addCollectionInWorkSpace(workspaceId, {
        id: collection.insertedId,
        name: collectionObj.name,
      });
      const responseData = new ApiResponseService(
        "Collection Imported",
        HttpStatusCode.OK,
        collection,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post(":workspaceId/importUrl/collection")
  @ApiResponse({ status: 201, description: "Collection Import Successfull" })
  @ApiResponse({ status: 400, description: "Failed to Import  Collection" })
  async importCollections(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
    @Body() importCollectionDto: ImportCollectionDto,
  ) {
    try {
      const response = await axios.get(importCollectionDto.url);
      const data = response.data;
      const responseType = response.headers["content-type"];
      const dataObj =
        responseType === "application/json" ? data : yml.load(data);

      const collectionObj = await this.parserService.parse(dataObj);
      const collection = await this.collectionService.importCollection(
        collectionObj,
      );
      await this.workspaceService.addCollectionInWorkSpace(workspaceId, {
        id: collection.insertedId,
        name: collectionObj.name,
      });
      const responseData = new ApiResponseService(
        "Collection Imported",
        HttpStatusCode.OK,
        collection,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
