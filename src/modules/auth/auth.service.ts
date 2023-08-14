import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ProfileService } from "@profile/profile.service";
import { LoginPayload } from "@auth/payload/login.payload";
import { ConfigService } from "@nestjs/config";
import { Db, InsertOneResult } from "mongodb";

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
  private readonly expiration: string;

  /**
   * Constructor
   * @param {JwtService} jwtService jwt service
   * @param {ConfigService} configService
   * @param {ProfileService} profileService profile service
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly profileService: ProfileService,
    @Inject("DATABASE_CONNECTION")
    private db: Db,
  ) {
    this.expiration = this.configService.get("app.webtokenExpirationTime");
  }

  /**
   * Creates a signed jwt token based on IProfile payload
   * @param {Profile} param dto to generate token from
   * @returns {Promise<ITokenReturnBody>} token body
   */
  async createToken({
    acknowledged,
    insertedId,
  }: InsertOneResult<Document>): Promise<ITokenReturnBody> {
    if (!acknowledged) {
      throw new Error("Insertion failed.");
    }
    const insertedDocument = await this.db.collection("profile").findOne({
      _id: insertedId,
    });
    return {
      expires: this.expiration,
      expiresPrettyPrint: AuthService.prettyPrintSeconds(this.expiration),
      token: this.jwtService.sign({
        _id: insertedId,
        username: insertedDocument.username,
        email: insertedDocument.email,
        avatar: insertedDocument.avatar,
      }),
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
   * Validates whether or not the profile exists in the database
   * @param {LoginPayload} payload login payload to authenticate with
   * @returns {Promise<IProfile>} registered profile
   */
  async validateUser(payload: LoginPayload) {
    const user = await this.profileService.getByUsernameAndPass(
      payload.username,
      payload.password,
    );
    console.log(user);
    if (!user) {
      throw new UnauthorizedException(
        "Could not authenticate. Please try again.",
      );
    }
    return user;
  }
}
