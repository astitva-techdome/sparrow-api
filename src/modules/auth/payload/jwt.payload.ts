import { ObjectId } from "mongodb";

export class JwtPayload {
  iat: number;
  exp: number;
  _id: ObjectId;
}
