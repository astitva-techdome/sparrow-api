import {
  Controller,
  Body,
  Post,
  UseGuards,
  Put,
  Param,
  Res,
  BadRequestException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PermissionService } from "../services/permission.service";
import { CreateOrUpdatePermissionDto } from "../../identity/payloads/permission.payload";
import { FastifyReply } from "fastify";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
import { JwtAuthGuard } from "@src/modules/common/guards/jwt-auth.guard";
/**
 * Permission Controller
 */
@ApiBearerAuth()
@ApiTags("permission")
@Controller("api/permission")
@UseGuards(JwtAuthGuard)
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
    try {
      const data = await this.permissionService.updatePermissionInWorkspace({
        workspaceId,
        userId,
        role,
      });
      const responseData = new ApiResponseService(
        "Permission Update",
        HttpStatusCode.OK,
        data,
      );
      res.status(responseData.httpStatusCode).send(responseData);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
