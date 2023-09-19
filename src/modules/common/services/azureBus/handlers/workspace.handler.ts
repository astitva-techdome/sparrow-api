import { BadRequestException, Injectable } from "@nestjs/common";
import { WorkspaceService } from "@src/modules/workspace/services/workspace.service";

@Injectable()
export class WorkspaceHandler {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async workspaceMessageSuccess(data: any): Promise<void> {
    await this.workspaceService.create(data);
  }

  async workspaceMessageFailure(err: any): Promise<void> {
    throw new BadRequestException(err);
  }
}
