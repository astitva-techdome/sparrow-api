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
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { WorkspaceService } from "../services/workspace.service";
import { CreateOrUpdateWorkspaceDto } from "../payloads/workspace.payload";
import { BlacklistGuard } from "../../common/guards/blacklist.guard";
import { PermissionService } from "../services/permission.service";
import { AddWorkspaceUserDto } from "../payloads/workspaceUser.payload";
import { FastifyReply } from "fastify";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";

/**
 * Workspace Controller
 */
@ApiBearerAuth()
@ApiTags("workspace")
@Controller("api/workspace")
@UseGuards(AuthGuard("jwt"), BlacklistGuard)
export class WorkSpaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly permissionService: PermissionService,
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
}
