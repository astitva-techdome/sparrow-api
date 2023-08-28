import { Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkSpaceController } from "./workspace.controller";
import { CommonModule } from "../common/common.module";
@Module({
  imports: [WorkspaceModule, CommonModule],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
  controllers: [WorkSpaceController],
})
export class WorkspaceModule {}
