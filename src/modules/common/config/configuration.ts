import { Env } from "@common/config/env.validation";

export default () => ({
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.APP_ENV || Env.DEV,
    url: process.env.APP_URL,
    webtokenSecretKey: process.env.WEBTOKEN_SECRET_KEY,
    webtokenExpirationTime:
      parseInt(process.env.WEBTOKEN_EXPIRATION_TIME) || 1800,
    defaultWorkspaceName: "My Workspace",
    userBlacklistPrefix: "BL_",
    refreshTokenSecretKey: process.env.REFRESHTOKEN_SECRET_KEY,
    validationCodeExpirationTime: parseInt(
      process.env.VALIDATION_CODE_EXPIRATION_TIME,
    ),
    refreshTokenExpirationTime: parseInt(
      process.env.REFRESHTOKEN_EXPIRATION_TIME,
    ),
    refreshTokenMaxSize: parseInt(process.env.REFRESHTOKEN_MAX_SIZE),
    email: process.env.SENDEREMAIL,
    password: process.env.SENDERPASSWORD,
  },
  db: {
    url: process.env.DB_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
  },
  azure: {
    connectionString: process.env.AZURE_CONNECTION_STRING,
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      appUrl: process.env.APP_URL,
      redirectUrl: process.env.LOGIN_REDIRECT_URL,
      accessType: process.env.GOOGLE_ACCESS_TYPE,
    },
  },
  kafka: {
    broker: process.env.KAFKA_BROKER,
  },
});
