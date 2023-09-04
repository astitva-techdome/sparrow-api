import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { JwtService } from "@nestjs/jwt";
import { WorkspaceService } from "../workspace/workspace.service";
import { AuthService } from "../auth/auth.service";
import { PermissionService } from "../permission/permission.service";
@Module({
  imports: [],
  providers: [
    UserService,
    AuthService,
    JwtService,
    WorkspaceService,
    PermissionService,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
