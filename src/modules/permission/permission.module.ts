import { Global, Module } from "@nestjs/common";
import { PermissionService } from "./services/permission.service";
import { PermissionController } from "./permission.controller";
import { PermissionRepository } from "./permission.repository";
import { UserModule } from "../user/user.module";
import { TeamModule } from "../team/team.module";
import { WorkspaceModule } from "../workspace/workspace.module";

@Global()
@Module({
  imports: [UserModule, TeamModule, WorkspaceModule],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService, PermissionRepository],
  controllers: [PermissionController],
})
export class PermissionModule {}
