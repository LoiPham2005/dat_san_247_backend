import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse, ValidationError } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Log error
        this.logger.error(
            `${request.method} ${request.url} - Status: ${status} - ${exception.message}`,
            exception.stack,
        );

        // Parse validation errors nếu có
        const validationErrors = this.parseValidationErrors(exceptionResponse);

        const errorResponse: ApiErrorResponse = {
            success: false,
            statusCode: status,
            message: this.getErrorMessage(exceptionResponse),
            error: exception.name || 'HttpException',
            errors: validationErrors,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
        };

        response.status(status).json(errorResponse);
    }

    private getErrorMessage(exceptionResponse: any): string {
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse;
        }

        if (exceptionResponse.message) {
            if (Array.isArray(exceptionResponse.message)) {
                return exceptionResponse.message[0];
            }
            return exceptionResponse.message;
        }

        return 'An error occurred';
    }

    private parseValidationErrors(exceptionResponse: any): ValidationError[] | undefined {
        if (
            typeof exceptionResponse === 'object' &&
            Array.isArray(exceptionResponse.message)
        ) {
            return exceptionResponse.message.map((msg: any) => {
                if (typeof msg === 'object' && msg.property) {
                    return {
                        field: msg.property,
                        message: Object.values(msg.constraints || {})[0] as string,
                        value: msg.value,
                    };
                }
                return {
                    field: 'unknown',
                    message: msg,
                };
            });
        }
        return undefined;
    }
}
