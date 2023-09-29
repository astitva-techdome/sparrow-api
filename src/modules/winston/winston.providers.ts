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

/**
 * Constructor a winston provider
 * @param loggerOpts
 */
export const createWinstonProviders = (
  loggerOpts: WinstonModuleOptions,
): Provider[] => {
  const { combine, timestamp, label, printf } = format;
  return [
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: () => createLogger(loggerOpts),
      useValue: winston.createLogger({
        level: "info",
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
            //filename: "D:\\Sparrow\\sparrow-api\\logs\\error.log", // Define the file path and name
            filename: "../../../logs/error.log",
            level: "info", // Set the log level for this transport
            format: combine(
              label({ label: "my-label" }),
              timestamp(),
              printf(({ level, message, label, timestamp }) => {
                return `${timestamp} [${label}] ${level}: ${message}`;
              }),
            ),
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
  return [
    {
      provide: WINSTON_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    },
    {
      provide: WINSTON_MODULE_PROVIDER,
      useFactory: (loggerOpts: LoggerOptions) => createLogger(loggerOpts),
      inject: [WINSTON_MODULE_OPTIONS],
    },
  ];
};
