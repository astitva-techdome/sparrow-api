import {
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { WorkspaceService } from "../services/workspace.service";
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from "../payloads/workspace.payload";
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
import {
  ImportCollectionDto,
  ImportJsonObjCollectionDto,
} from "../payloads/collection.payload";
import { JwtAuthGuard } from "@src/modules/common/guards/jwt-auth.guard";
import { ObjectId } from "mongodb";
import { EnvironmentService } from "../services/environment.service";

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
    private readonly environmentService: EnvironmentService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create a new User Workspace",
    description: "This will create a new Workspace for User",
  })
  @ApiResponse({ status: 201, description: "Workspace Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Workspace Failed" })
  async createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Res() res: FastifyReply,
  ) {
    const data = await this.workspaceService.create(createWorkspaceDto);

    const workspace = await this.workspaceService.get(
      data.insertedId.toString(),
    );
    const responseData = new ApiResponseService(
      "Workspace Created",
      HttpStatusCode.CREATED,
      workspace,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Get(":workspaceId")
  @ApiOperation({
    summary: "Retrieve a Workspace",
    description: "This will retrieve a workspace",
  })
  @ApiResponse({ status: 200, description: "Fetch Workspace Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Workspace Request Failed" })
  async getWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.workspaceService.get(workspaceId);
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.OK,
      data,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }
  @Get("user/:userId")
  @ApiOperation({
    summary: "Retreive all User's Workspaces",
    description: "This will retrieve all User's Wprkspaces",
  })
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
    const data = await this.workspaceService.getAllWorkSpaces(userId);
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.OK,
      data,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }
  @Get("team/:teamId")
  @ApiOperation({
    summary: "Retreive all Team's Workspaces",
    description: "This will retrieve all Team's Workspaces",
  })
  @ApiResponse({
    status: 200,
    description: "All Workspace Of Team Received Successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Fetching All Team Workspaces Request Failed",
  })
  async getTeamWorkspaces(
    @Param("teamId") teamId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.workspaceService.getAllTeamWorkSpaces(teamId);
    const responseData = new ApiResponseService(
      "Success",
      HttpStatusCode.OK,
      data,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }
  @Put(":workspaceId")
  @ApiOperation({
    summary: "Update a Workspace",
    description: "This will update User's Workspace",
  })
  @ApiResponse({ status: 200, description: "Workspace Updated Successfully" })
  @ApiResponse({ status: 400, description: "Update Workspace Failed" })
  async updateWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Res() res: FastifyReply,
  ) {
    await this.workspaceService.update(workspaceId, updateWorkspaceDto);

    const workspace = await this.workspaceService.get(workspaceId);
    const responseData = new ApiResponseService(
      "Workspace Updated",
      HttpStatusCode.OK,
      workspace,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Delete(":workspaceId")
  @ApiOperation({
    summary: "Delete a Workspace",
    description: "This will delete a  User's Workspace",
  })
  @ApiResponse({ status: 200, description: "Workspace Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Workspace Failed" })
  async deleteWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.workspaceService.delete(workspaceId);
    const responseData = new ApiResponseService(
      "Workspace Deleted",
      HttpStatusCode.OK,
      data,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Post(":workspaceId/user/:userId")
  @ApiOperation({
    summary: "Add a User in  Workspace",
    description: "You can add another user to your Workspace",
  })
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
    await this.permissionService.create(params);
    const workspace = await this.workspaceService.get(workspaceId);
    const responseData = new ApiResponseService(
      "User Added",
      HttpStatusCode.OK,
      workspace,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Delete(":workspaceId/user/:userId")
  @ApiOperation({
    summary: "Remove A User From Workspace",
    description: "You can remove a another user from your Workspace",
  })
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
    const data = await this.permissionService.removeSinglePermissionInWorkspace(
      params,
    );
    const responseData = new ApiResponseService(
      "User Removed",
      HttpStatusCode.OK,
      data,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Post(":workspaceId/importFile/collection")
  @ApiOperation({
    summary: "Import a Collection From A File",
    description: "You can import a collection from a json or ymal file",
  })
  @UseInterceptors(FileInterceptor("file"))
  @ApiResponse({ status: 201, description: "Collection Import Successfull" })
  @ApiResponse({ status: 400, description: "Failed to Import  Collection" })
  async importCollection(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
    @UploadedFile()
    file: MemoryStorageFile,
  ) {
    const dataBuffer = file.buffer;
    const dataString = dataBuffer.toString("utf8");
    const dataObj =
      file.mimetype === "application/json"
        ? JSON.parse(dataString)
        : yml.load(dataString);
    const collectionObj = await this.parserService.parse(dataObj);
    await this.workspaceService.addCollectionInWorkSpace(workspaceId, {
      id: new ObjectId(collectionObj.insertedId),
      name: collectionObj.name,
    });
    const collection = await this.collectionService.getCollection(
      collectionObj.insertedId,
    );
    const responseData = new ApiResponseService(
      "Collection Imported",
      HttpStatusCode.OK,
      collection,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Post(":workspaceId/importUrl/collection")
  @ApiOperation({
    summary: "Import a Collection from a url",
    description: "You can import a collection from url",
  })
  @ApiResponse({ status: 201, description: "Collection Import Successfull" })
  @ApiResponse({ status: 400, description: "Failed to Import  Collection" })
  async importCollections(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
    @Body() importCollectionDto: ImportCollectionDto,
  ) {
    const response = await axios.get(importCollectionDto.url);
    const data = response.data;
    const responseType = response.headers["content-type"];
    const dataObj = responseType === "application/json" ? data : yml.load(data);

    const collectionObj = await this.parserService.parse(dataObj);
    await this.workspaceService.addCollectionInWorkSpace(workspaceId, {
      id: new ObjectId(collectionObj.insertedId),
      name: collectionObj.name,
    });
    const responseData = new ApiResponseService(
      "Collection Imported",
      HttpStatusCode.OK,
      collectionObj,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Post(":workspaceId/importJson/collection")
  @ApiOperation({
    summary: "Import a Collection From A JsonObj",
    description: "You can import a collection from jsonObj",
  })
  @ApiResponse({
    status: 201,
    description: "Collection json Import Successfull",
  })
  @ApiResponse({ status: 400, description: "Failed to Import  Collection" })
  async importJsonCollection(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
    @Body() jsonObjDto: ImportJsonObjCollectionDto,
  ) {
    const collectionObj = await this.parserService.parse(jsonObjDto.jsonObj);
    await this.workspaceService.addCollectionInWorkSpace(workspaceId, {
      id: new ObjectId(collectionObj.id),
      name: collectionObj.name,
    });

    const collection = await this.collectionService.getCollection(
      collectionObj.insertedId,
    );
    const responseData = new ApiResponseService(
      "Collection Imported",
      HttpStatusCode.OK,
      collection,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }
}
