import { Global, Module } from "@nestjs/common";
import { PermissionService } from "./services/permission.service";
import { PermissionController } from "./permission.controller";
import { PermissionRepository } from "./permission.repository";
import { UserModule } from "../user/user.module";

@Global()
@Module({
  imports: [UserModule],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService, PermissionRepository],
  controllers: [PermissionController],
})
export class PermissionModule {}
