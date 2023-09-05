import { Module } from "@nestjs/common";
import { WorkspaceService } from "./services/workspace.service";
import { WorkSpaceController } from "./workspace.controller";
import { PermissionModule } from "../permission/permission.module";
import { WorkspaceRepository } from "./workspace.repository";
@Module({
  imports: [WorkspaceModule, PermissionModule],
  providers: [WorkspaceService, WorkspaceRepository],
  exports: [WorkspaceService],
  controllers: [WorkSpaceController],
})
export class WorkspaceModule {}
