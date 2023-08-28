import { Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkSpaceController } from "./workspace.controller";
@Module({
  imports: [WorkspaceModule],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
  controllers: [WorkSpaceController],
})
export class WorkspaceModule {}
