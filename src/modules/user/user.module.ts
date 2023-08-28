import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthService } from "../auth/auth.service";
import { JwtService } from "@nestjs/jwt";
@Module({
  imports: [UserModule],
  providers: [UserService, AuthService, JwtService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
