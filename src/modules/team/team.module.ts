import { Module } from "@nestjs/common";
import { TeamService } from "./services/team.service";
import { TeamController } from "./team.controller";
import { TeamRepository } from "./team.repository";
import { TeamUserService } from "./services/team-user.service";
import { PermissionRepository } from "../permission/permission.repository";
import { PermissionService } from "../permission/services/permission.service";
@Module({
  imports: [TeamModule],
  providers: [
    TeamService,
    TeamRepository,
    TeamUserService,
    PermissionRepository,
    PermissionService,
  ],
  exports: [TeamService, TeamUserService],
  controllers: [TeamController],
})
export class TeamModule {}
