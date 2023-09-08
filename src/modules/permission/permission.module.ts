import { Module, forwardRef } from "@nestjs/common";
import { PermissionService } from "./services/permission.service";
import { PermissionController } from "./permission.controller";
import { PermissionRepository } from "./permission.repository";
// import { UserRepository } from "../user/user.repository";
import { UserModule } from "../user/user.module";
@Module({
  imports: [PermissionModule, forwardRef(() => UserModule)],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
