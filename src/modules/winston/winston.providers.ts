import { Provider } from "@nestjs/common";
import winston, { createLogger, format, Logger, LoggerOptions } from "winston";
import {
  WINSTON_MODULE_OPTIONS,
  WINSTON_MODULE_PROVIDER,
} from "@winston/winston.constants";
import {
  WinstonModuleAsyncOptions,
  WinstonModuleOptions,
} from "@winston/winston.interfaces";
import path from "path";

/**
 * Constructor a winston provider
 * @param loggerOpts
 */
export const createWinstonProviders = (
  loggerOpts: WinstonModuleOptions,
): Provider[] => {
  const { combine, timestamp, label, printf } = format;
  console.log("check");
  console.log(path.join(__dirname, "../../logs/error.log"));
  return [
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: () => createLogger(loggerOpts),
      useValue: winston.createLogger({
        level: "error",
        format: combine(
          label({ label: "my-label" }),
          timestamp(),
          printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
          }),
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: path.join(__dirname, "../../logs/error.log"),
            level: "error", // Set the log level for this transport
            format: combine(
              label({ label: "my-label" }),
              timestamp(),
              printf(({ level, message, label, timestamp }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
              }),
            ),
          }).on("error", (err) => {
            console.error(`File transport error: ${err}`);
          }),
        ],
      }),
    },
    Logger,
  ];
};

/**
 * Async constructor for a winston provider
 * @param options
 */
export const createWinstonAsyncProviders = (
  options: WinstonModuleAsyncOptions,
): Provider[] => {
  const { combine, timestamp, label, printf } = format;
  return [
    {
      provide: WINSTON_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
      useValue: winston.createLogger({
        level: "error",
        format: combine(
          label({ label: "my-label" }),
          timestamp(),
          printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
          }),
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: path.join(__dirname, "../../logs/error.log"),
            level: "error", // Set the log level for this transport
            format: combine(
              label({ label: "my-label" }),
              timestamp(),
              printf(({ level, message, label, timestamp }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
              }),
            ),
          }).on("error", (err) => {
            console.error(`File transport error: ${err}`);
          }),
        ],
      }),
    },
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: (loggerOpts: LoggerOptions) => createLogger(loggerOpts),
      inject: [WINSTON_MODULE_OPTIONS],
      useValue: winston.createLogger({
        level: "error",
        format: combine(
          label({ label: "my-label" }),
          timestamp(),
          printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
          }),
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: path.join(__dirname, "../../logs/error.log"),
            level: "error", // Set the log level for this transport
            format: combine(
              label({ label: "my-label" }),
              timestamp(),
              printf(({ level, message, label, timestamp }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
              }),
            ),
          }).on("error", (err) => {
            console.error(`File transport error: ${err}`);
          }),
        ],
      }),
    },
  ];
};
