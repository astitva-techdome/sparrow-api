import { Module } from "@nestjs/common";
import { PermissionService } from "./services/permission.service";
import { PermissionController } from "./permission.controller";
import { PermissionRepository } from "./permission.repository";
// import { UserRepository } from "../user/user.repository";
@Module({
  imports: [PermissionModule],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
