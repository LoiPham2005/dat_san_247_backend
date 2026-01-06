import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception?.status || exception?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception?.message || 'Internal server error';

        // Log error với stack trace
        this.logger.error(
            `${request.method} ${request.url} - Status: ${status} - ${message}`,
            exception?.stack,
        );

        const errorResponse: ApiErrorResponse = {
            success: false,
            statusCode: status,
            message: status === HttpStatus.INTERNAL_SERVER_ERROR ? 'Internal server error' : message,
            error: exception?.name || 'Error',
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(process.env.NODE_ENV === 'development' && { stack: exception?.stack }),
        };

        response.status(status).json(errorResponse);
    }
}
