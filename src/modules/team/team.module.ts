import { Module } from "@nestjs/common";
import { TeamService } from "./services/team.service";
import { TeamController } from "./team.controller";
import { TeamRepository } from "./team.repository";
import { TeamUserService } from "./services/team-user.service";
@Module({
  imports: [TeamModule],
  providers: [TeamService, TeamRepository, TeamUserService],
  exports: [TeamService, TeamUserService],
  controllers: [TeamController],
})
export class TeamModule {}
