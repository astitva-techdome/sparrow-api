import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongoClient, Db } from "mongodb";

@Injectable()
export class DatabaseConnectionService {
  private db: Db;

  constructor(private readonly configService: ConfigService) {
    this.connect();
  }

  async connect() {
    try {
      const client = await MongoClient.connect(
        this.configService.get("db.url"),
      );

      this.db = client.db();
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  getDb(): Db {
    return this.db;
  }
}
