import { Module } from "@nestjs/common";
import { TeamService } from "./services/team.service";
import { TeamController } from "./team.controller";
import { TeamRepository } from "./team.repository";
import { TeamUserService } from "./services/team-user.service";
import { PermissionRepository } from "../permission/permission.repository";
import { PermissionService } from "../permission/services/permission.service";
import { UserRepository } from "../user/user.repository";
import { WorkspaceService } from "../workspace/services/workspace.service";
import { AuthService } from "../auth/auth.service";
import { WorkspaceRepository } from "../workspace/workspace.repository";
import { JwtStrategy } from "../auth/jwt.strategy";
import { JwtService } from "@nestjs/jwt";
@Module({
  imports: [TeamModule],
  providers: [
    TeamService,
    TeamRepository,
    TeamUserService,
    PermissionRepository,
    PermissionService,
    UserRepository,
    WorkspaceService,
    AuthService,
    WorkspaceRepository,
    JwtStrategy,
    JwtService,
  ],
  exports: [TeamService, TeamUserService],
  controllers: [TeamController],
})
export class TeamModule {}
