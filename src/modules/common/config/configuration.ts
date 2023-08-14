import { Env } from "@common/config/env.validation";

export default () => ({
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.APP_ENV || Env.DEV,
    url: process.env.APP_URL,
    webtokenSecretKey: process.env.WEBTOKEN_SECRET_KEY,
    webtokenExpirationTime:
      parseInt(process.env.WEBTOKEN_EXPIRATION_TIME) || 1800,
  },
  db: {
    url: process.env.DB_URL,
  },
});
