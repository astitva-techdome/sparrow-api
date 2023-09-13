import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./user.controller";
import { JwtService } from "@nestjs/jwt";
import { WorkspaceService } from "../workspace/services/workspace.service";
import { AuthService } from "../auth/auth.service";
import { UserRepository } from "./user.repository";
import { WorkspaceRepository } from "../workspace/workspace.repository";
import { TeamUserService } from "../team/services/team-user.service";
import { TeamRepository } from "../team/team.repository";
@Module({
  imports: [UserModule],
  providers: [
    UserService,
    AuthService,
    JwtService,
    WorkspaceService,
    // PermissionService,
    UserRepository,
    WorkspaceRepository,
    // PermissionRepository,
    TeamUserService,
    TeamRepository,
  ],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
