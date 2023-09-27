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
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { WorkspaceService } from "../services/workspace.service";
import { CreateOrUpdateWorkspaceDto } from "../payloads/workspace.payload";
import { BlacklistGuard } from "../../common/guards/blacklist.guard";
import { PermissionService } from "../services/permission.service";
import { AddWorkspaceUserDto } from "../payloads/workspaceUser.payload";
import { FastifyReply } from "fastify";

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
    const data = await this.workspaceService.create(createWorkspaceDto);
    res.status(data.httpStatusCode).send(data);
  }

  @Get(":workspaceId")
  @ApiResponse({ status: 200, description: "Fetch Workspace Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Workspace Request Failed" })
  async getWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.workspaceService.get(workspaceId);
    res.status(data.httpStatusCode).send(data);
  }

  @Put(":workspaceId")
  @ApiResponse({ status: 200, description: "Workspace Updated Successfully" })
  @ApiResponse({ status: 400, description: "Update Workspace Failed" })
  async updateWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Body() updateWorkspaceDto: CreateOrUpdateWorkspaceDto,
    @Res() res: FastifyReply,
  ) {
    const data = await this.workspaceService.update(
      workspaceId,
      updateWorkspaceDto,
    );
    res.status(data.httpStatusCode).send(data);
  }

  @Delete(":workspaceId")
  @ApiResponse({ status: 200, description: "Workspace Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Workspace Failed" })
  async deleteWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.workspaceService.delete(workspaceId);
    res.status(data.httpStatusCode).send(data);
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
    const response = await this.permissionService.create(params);
    res.status(response.httpStatusCode).send(response);
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
    const data = await this.permissionService.removeSinglePermissionInWorkspace(
      params,
    );
    res.status(data.httpStatusCode).send(data);
  }
}
