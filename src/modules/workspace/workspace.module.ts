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
import { OwnerPermissionHandler } from "./handlers/ownerPermisson.handler";
import { RemovePermissionHandler } from "./handlers/removePermission.handler";
import { CollectionService } from "./services/collection.service";
import { collectionRepository } from "./repositories/collection.repository";
import { collectionController } from "./controllers/collection.controller";
import { CollectionRequestService } from "./services/collection-request.service";
@Module({
  imports: [IdentityModule],
  providers: [
    WorkspaceService,
    WorkspaceRepository,
    PermissionService,
    PermissionRepository,
    WorkspaceHandler,
    PermissionHandler,
    OwnerPermissionHandler,
    RemovePermissionHandler,
    collectionRepository,
    CollectionService,
    CollectionRequestService,
  ],
  exports: [],
  controllers: [
    WorkSpaceController,
    PermissionController,
    collectionController,
  ],
})
export class WorkspaceModule {}
