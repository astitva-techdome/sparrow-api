import { Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkSpaceController } from "./workspace.controller";
import { PermissionModule } from "../permission/permission.module";
@Module({
  imports: [WorkspaceModule, PermissionModule],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
  controllers: [WorkSpaceController],
})
export class WorkspaceModule {}
