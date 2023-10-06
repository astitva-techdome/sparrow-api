import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UserService } from "./services/user.service";
import { UserRepository } from "./repositories/user.repository";
import { UserController } from "./controllers/user.controller";
import { TeamService } from "./services/team.service";
import { TeamUserService } from "./services/team-user.service";
import { TeamRepository } from "./repositories/team.repository";
import { TeamController } from "./controllers/team.controller";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get("app.webtokenSecretKey"),
          signOptions: {
            ...(configService.get("app.webtokenExpirationTime")
              ? {
                  expiresIn: Number(
                    configService.get("app.webtokenExpirationTime"),
                  ),
                }
              : {}),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UserService,
    JwtService,
    UserRepository,
    TeamService,
    TeamUserService,
    TeamRepository,
  ],
  exports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    GoogleStrategy,
    AuthService,
    UserService,
    UserRepository,
    TeamService,
    TeamUserService,
    TeamRepository,
  ],
  controllers: [AuthController, UserController, TeamController],
})
export class IdentityModule {}
