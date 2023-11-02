import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { PinoLogger } from "nestjs-pino";

@Catch()
export class LoggingExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject("ErrorLogger") private readonly errorLogger: PinoLogger,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();
    this.errorLogger.error(exception.getResponse());
    response.status(status).send({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}
