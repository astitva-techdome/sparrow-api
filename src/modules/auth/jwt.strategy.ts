import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Db, ObjectId } from "mongodb";
import { JwtPayload } from "./payload/jwt.payload";
import { Collections } from "../common/enum/database.collection.enum";
import { ContextService } from "../common/services/context.service";

/**
 * Jwt Strategy Class
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor
   * @param {ConfigService} configService
   * @param {Db} mongodb
   */
  constructor(
    readonly configService: ConfigService,
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private contextService: ContextService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("app.webtokenSecretKey"),
    });
  }

  /**
   * Checks if the bearer token is a valid token
   * @param {JwtPayload} jwtPayload validation method for jwt token
   * @param {any} done callback to resolve the request user with
   * @returns {Promise<boolean>} whether or not to validate the jwt token
   */
  async validate({ iat, exp, id }: JwtPayload) {
    const timeDiff = exp - iat;
    const _id = new ObjectId(id);
    if (timeDiff <= 0) {
      throw new UnauthorizedException();
    }
    const user = await this.db.collection(Collections.USER).findOne({
      _id,
    });

    this.contextService.set("user", user);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user._id;
  }
}
