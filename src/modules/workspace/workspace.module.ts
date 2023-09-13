import { Module } from "@nestjs/common";
import { WorkspaceService } from "./services/workspace.service";
import { WorkSpaceController } from "./workspace.controller";
import { WorkspaceRepository } from "./workspace.repository";
@Module({
  imports: [WorkspaceModule],
  providers: [WorkspaceService, WorkspaceRepository],
  exports: [WorkspaceService, WorkspaceRepository],
  controllers: [WorkSpaceController],
})
export class WorkspaceModule {}
