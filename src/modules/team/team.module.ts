import { Module } from "@nestjs/common";
import { TeamService } from "./services/team.service";
import { TeamController } from "./team.controller";
import { TeamRepository } from "./team.repository";
import { TeamUserService } from "./services/team-user.service";
import { UserModule } from "../user/user.module";
@Module({
  imports: [UserModule],
  providers: [TeamService, TeamRepository, TeamUserService],
  exports: [TeamService, TeamUserService, TeamRepository],
  controllers: [TeamController],
})
export class TeamModule {}
