import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { WorkspaceService } from "./services/workspace.service";
import { CreateOrUpdateWorkspaceDto } from "./payload/workspace.payload";
import { BlacklistGuard } from "../common/guards/blacklist.guard";

/**
 * Workspace Controller
 */
@ApiBearerAuth()
@ApiTags("workspace")
@Controller("api/workspace")
@UseGuards(AuthGuard("jwt"), BlacklistGuard)
export class WorkSpaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @ApiResponse({ status: 201, description: "Workspace Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Workspace Failed" })
  async createWorkspace(
    @Body() createWorkspaceDto: CreateOrUpdateWorkspaceDto,
  ) {
    return await this.workspaceService.create(createWorkspaceDto);
  }

  @Get(":workspaceId")
  @ApiResponse({ status: 200, description: "Fetch Workspace Request Received" })
  @ApiResponse({ status: 400, description: "Fetch Workspace Request Failed" })
  async getWorkspace(@Param("workspaceId") workspaceId: string) {
    const workspace = await this.workspaceService.get(workspaceId);
    if (!workspace) {
      throw new BadRequestException(
        "The workspace with that id could not be found.",
      );
    }
    return workspace;
  }

  @Put(":workspaceId")
  @ApiResponse({ status: 200, description: "Workspace Updated Successfully" })
  @ApiResponse({ status: 400, description: "Update Workspace Failed" })
  async updateWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Body() updateWorkspaceDto: CreateOrUpdateWorkspaceDto,
  ) {
    const updatedWorkspace = await this.workspaceService.update(
      workspaceId,
      updateWorkspaceDto,
    );
    if (!updatedWorkspace) {
      throw new BadRequestException(
        "The workspace with that id could not be found.",
      );
    }
    return updatedWorkspace;
  }

  @Delete(":workspaceId")
  @ApiResponse({ status: 200, description: "Workspace Deleted Successfully" })
  @ApiResponse({ status: 400, description: "Delete Workspace Failed" })
  async deleteWorkspace(@Param("workspaceId") workspaceId: string) {
    const deletedWorkspace = await this.workspaceService.delete(workspaceId);
    if (!deletedWorkspace) {
      throw new BadRequestException(
        "The workspace with that id could not be found.",
      );
    }
    return { message: "Workspace deleted successfully" };
  }
}
