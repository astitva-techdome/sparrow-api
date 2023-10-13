import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { FastifyRequest } from "fastify";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESHTOKEN_SECRET_KEY,
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: any) {
    const refreshToken = req.headers.authorization.replace("Bearer", "").trim();

    return { _id: payload._id, refreshToken };
  }
}
