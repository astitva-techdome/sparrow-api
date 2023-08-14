import { Global, Module } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: "DATABASE_CONNECTION",
      useFactory: async (): Promise<Db> => {
        try {
          const client = await MongoClient.connect(process.env.DB_URL);
          return client.db();
        } catch (e) {
          throw e;
        }
      },
    },
  ],
  exports: ["DATABASE_CONNECTION"],
})
export class CommonModule {}
