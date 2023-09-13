import { Module } from "@nestjs/common";
import { WorkspaceService } from "./services/workspace.service";
import { WorkSpaceController } from "./workspace.controller";
import { WorkspaceRepository } from "./workspace.repository";
import { TeamModule } from "../team/team.module";
import { UserModule } from "../user/user.module";
@Module({
  imports: [TeamModule, UserModule],
  providers: [WorkspaceService, WorkspaceRepository],
  exports: [WorkspaceService, WorkspaceRepository],
  controllers: [WorkSpaceController],
})
export class WorkspaceModule {}
