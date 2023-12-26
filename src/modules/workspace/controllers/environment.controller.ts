import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateEnvironmentDto } from "../payloads/environment.payload";
import { FastifyReply } from "fastify";
import { EnvironmentService } from "../services/environment.service";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";
import { BlacklistGuard } from "@src/modules/common/guards/blacklist.guard";

import { JwtAuthGuard } from "@src/modules/common/guards/jwt-auth.guard";
import { EnvironmentType } from "@src/modules/common/models/environment.model";
import { WorkspaceService } from "../services/workspace.service";

@ApiBearerAuth()
@ApiTags("environment")
@Controller("api/environment")
@UseGuards(JwtAuthGuard, BlacklistGuard)
export class EnvironmentController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create A Environment",
    description:
      "This will create a environment and add this environment in user's workspace",
  })
  @ApiResponse({ status: 201, description: "Environment Created Successfully" })
  @ApiResponse({ status: 400, description: "Create Environment Failed" })
  async createCollection(
    @Body() createEnvironmentDto: CreateEnvironmentDto,
    @Res() res: FastifyReply,
  ) {
    const workspaceId = createEnvironmentDto.workspaceId;
    const data = await this.environmentService.createEnvironment(
      createEnvironmentDto,
      EnvironmentType.LOCAL,
    );
    const environment = await this.environmentService.getEnvironment(
      data.insertedId.toString(),
    );
    await this.workspaceService.addEnvironmentInWorkSpace(workspaceId, {
      id: environment._id,
      name: environment.name,
      type: environment.type,
    });
    const responseData = new ApiResponseService(
      "Environment Created",
      HttpStatusCode.CREATED,
      environment,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }

  @Delete(":environmentId/workspace/:workspaceId")
  @ApiOperation({
    summary: "Delete a Environment",
    description: "This will delete a environment",
  })
  @ApiResponse({ status: 201, description: "Removed Environment Successfully" })
  @ApiResponse({ status: 400, description: "Failed to remove Environment" })
  async deleteEnvironment(
    @Param("environmentId") environmentId: string,
    @Param("workspaceId") workspaceId: string,
    @Res() res: FastifyReply,
  ) {
    const environment = await this.environmentService.deleteEnvironment(
      environmentId,
      workspaceId,
    );

    await this.workspaceService.deleteEnvironmentInWorkSpace(
      workspaceId.toString(),
      environmentId,
    );
    const responseData = new ApiResponseService(
      "Environment Removed",
      HttpStatusCode.OK,
      environment,
    );
    res.status(responseData.httpStatusCode).send(responseData);
  }
}
