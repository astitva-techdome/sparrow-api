import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./user.controller";
import { JwtService } from "@nestjs/jwt";
import { WorkspaceService } from "../workspace/services/workspace.service";
import { AuthService } from "../auth/auth.service";
import { PermissionService } from "../permission/services/permission.service";
import { UserRepository } from "./user.repository";
import { WorkspaceRepository } from "../workspace/workspace.repository";
import { PermissionRepository } from "../permission/permission.repository";
@Module({
  imports: [UserModule],
  providers: [
    UserService,
    AuthService,
    JwtService,
    WorkspaceService,
    PermissionService,
    UserRepository,
    WorkspaceRepository,
    PermissionRepository,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
