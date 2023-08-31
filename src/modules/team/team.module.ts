import { Module } from "@nestjs/common";
import { TeamService } from "./team.service";
import { TeamController } from "./team.controller";
@Module({
  imports: [TeamModule],
  providers: [TeamService],
  exports: [TeamService],
  controllers: [TeamController],
})
export class TeamModule {}
