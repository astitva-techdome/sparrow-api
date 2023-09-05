import { Module } from "@nestjs/common";
import { TeamService } from "./services/team.service";
import { TeamController } from "./team.controller";
import { TeamRepository } from "./team.repository";
@Module({
  imports: [TeamModule],
  providers: [TeamService, TeamRepository],
  exports: [TeamService],
  controllers: [TeamController],
})
export class TeamModule {}
