import {
  Controller,
  Body,
  Post,
  UseGuards,
  Put,
  Param,
  Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PermissionService } from "../services/permission.service";
import { CreateOrUpdatePermissionDto } from "../../identity/payloads/permission.payload";
import { AuthGuard } from "@nestjs/passport";
import { FastifyReply } from "fastify";
/**
 * Permission Controller
 */
@ApiBearerAuth()
@ApiTags("permission")
@Controller("api/permission")
@UseGuards(AuthGuard("jwt"))
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiResponse({ status: 201, description: "Permission Added Successfully" })
  @ApiResponse({ status: 400, description: "Create Permission Failed" })
  async createPermission(
    @Body() createPermissionDto: CreateOrUpdatePermissionDto,
  ) {
    return await this.permissionService.create(createPermissionDto);
  }

  @Put(":workspaceId/user/:userId")
  @ApiResponse({ status: 200, description: "Workspace Updated Successfully" })
  @ApiResponse({ status: 400, description: "Update Workspace Failed" })
  async updateWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Param("userId") userId: string,
    @Body() role: string,
    @Res() res: FastifyReply,
  ) {
    const data = await this.permissionService.updatePermissionInWorkspace({
      workspaceId,
      userId,
      role,
    });
    res.status(data.httpStatusCode).send(data);
  }
}
