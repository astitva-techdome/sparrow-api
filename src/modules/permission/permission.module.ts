import { Module } from "@nestjs/common";
import { PermissonService } from "./permission.service";
import { PermissionController } from "./permission.controller";
@Module({
  imports: [PermissonModule],
  providers: [PermissonService],
  exports: [PermissonService],
  controllers: [PermissionController],
})
export class PermissonModule {}
