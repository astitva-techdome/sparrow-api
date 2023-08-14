import { Module } from "@nestjs/common";
import { ProfileService } from "@profile/profile.service";
import { ProfileController } from "@profile/profile.controller";
// import { DatabaseConnectionService } from "modules/common/services/database.service";
import { CommonModule } from "@common/common.module";

@Module({
  imports: [CommonModule],
  providers: [ProfileService],
  exports: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
