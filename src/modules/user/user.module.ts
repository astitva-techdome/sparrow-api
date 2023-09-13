import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserController } from "./user.controller";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "./user.repository";
import { WorkspaceModule } from "../workspace/workspace.module";
import { AuthModule } from "../auth/auth.module";
@Module({
  imports: [WorkspaceModule, AuthModule],
  providers: [UserService, JwtService, UserRepository],
  exports: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
