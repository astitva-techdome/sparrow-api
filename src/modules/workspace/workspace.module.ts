import { Module } from "@nestjs/common";
import { WorkspaceService } from "./services/workspace.service";
import { WorkSpaceController } from "./controllers/workspace.controller";
import { WorkspaceRepository } from "./repositories/workspace.repository";
import { IdentityModule } from "../identity/identity.module";
import { PermissionService } from "./services/permission.service";
import { PermissionRepository } from "./repositories/permission.repository";
import { PermissionController } from "./controllers/permission.controller";
import { WorkspaceHandler } from "./handlers/workspace.handler";
import { PermissionHandler } from "./handlers/permission.handler";
@Module({
  imports: [IdentityModule],
  providers: [
    WorkspaceService,
    WorkspaceRepository,
    PermissionService,
    PermissionRepository,
    WorkspaceHandler,
    PermissionHandler,
  ],
  exports: [],
  controllers: [WorkSpaceController, PermissionController],
})
export class WorkspaceModule {}
