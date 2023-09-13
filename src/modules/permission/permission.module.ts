import { Global, Module } from "@nestjs/common";
import { PermissionService } from "./services/permission.service";
import { PermissionController } from "./permission.controller";
import { PermissionRepository } from "./permission.repository";
import { TeamModule } from "../team/team.module";

@Global()
@Module({
  imports: [TeamModule],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
