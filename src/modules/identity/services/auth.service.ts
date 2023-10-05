import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginPayload } from "../payloads/login.payload";
import { ConfigService } from "@nestjs/config";
import { Db, ObjectId } from "mongodb";
import { ContextService } from "@src/modules/common/services/context.service";
import { Collections } from "@src/modules/common/enum/database.collection.enum";
import { createHmac } from "crypto";
import { User } from "@src/modules/common/models/user.model";
import { Logger } from "nestjs-pino";

/**
 * Models a typical Login/Register route return body
 */
export interface ITokenReturnBody {
  /**
   * When the token is to expire in seconds
   */
  expires: string;
  /**
   * A human-readable format of expires
   */
  expiresPrettyPrint: string;
  /**
   * The Bearer token
   */
  token: string;
}

/**
 * Authentication Service
 */
@Injectable()
export class AuthService {
  /**
   * Time in seconds when the token is to expire
   * @type {string}
   */
  private readonly expiration: number;

  /**
   * Constructor
   * @param {JwtService} jwtService jwt service
   * @param {ConfigService} configService
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject("DATABASE_CONNECTION")
    private db: Db,
    private contextService: ContextService,
    private readonly logger: Logger,
  ) {
    this.expiration = this.configService.get("app.webtokenExpirationTime");
  }

  /**
   * Creates a signed jwt token based on IUser payload
   * @param {acknowledged} param
   * @param {insertedId} param id of document
   * @returns {Promise<ITokenReturnBody>} token body
   */
  async createToken(insertedId: ObjectId): Promise<ITokenReturnBody> {
    const user = await this.db.collection(Collections.USER).findOne(
      {
        _id: insertedId,
      },
      { projection: { password: 0 } },
    );
    this.contextService.set("user", user);
    return {
      expires: this.expiration.toString(),
      expiresPrettyPrint: AuthService.prettyPrintSeconds(
        this.expiration.toString(),
      ),
      token: this.jwtService.sign(
        {
          _id: insertedId,
          email: user.email,
          permissions: user.permissions,
          exp: Date.now() / 1000 + this.expiration,
        },
        { secret: this.configService.get("app.webtokenSecretKey") },
      ),
    };
  }

  /**
   * Formats the time in seconds into human-readable format
   * @param {string} time
   * @returns {string} hrf time
   */
  private static prettyPrintSeconds(time: string): string {
    const ntime = Number(time);
    const hours = Math.floor(ntime / 3600);
    const minutes = Math.floor((ntime % 3600) / 60);
    const seconds = Math.floor((ntime % 3600) % 60);

    return `${hours > 0 ? hours + (hours === 1 ? " hour," : " hours,") : ""} ${
      minutes > 0 ? minutes + (minutes === 1 ? " minute" : " minutes") : ""
    } ${seconds > 0 ? seconds + (seconds === 1 ? " second" : " seconds") : ""}`;
  }

  /**
   * Validates whether or not the User exists in the database
   * @param {LoginPayload} payload login payload to authenticate with
   * @returns {Promise<IUser>} registered User
   */
  async validateUser(payload: LoginPayload) {
    const user = await this.getUserByEmailAndPass(
      payload.email,
      payload.password,
    );
    if (!user) {
      throw new UnauthorizedException(
        "Could not authenticate. Please try again.",
      );
    }
    return user;
  }
  async getUserByEmailAndPass(email: string, password: string) {
    return await this.db.collection<User>(Collections.USER).findOne({
      email,
      password: createHmac("sha256", password).digest("hex"),
    });
  }
}
