import { Module } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";
// import { DatabaseConnectionService } from "modules/common/services/database.service";
import { CommonModule } from "modules/common/common.module";

@Module({
  imports: [CommonModule],
  providers: [ProfileService],
  exports: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
