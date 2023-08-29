import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { JwtService } from "@nestjs/jwt";
import { WorkspaceService } from "../workspace/workspace.service";
import { AuthService } from "../auth/auth.service";
@Module({
  imports: [],
  providers: [UserService, AuthService, JwtService, WorkspaceService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
