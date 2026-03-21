import { HttpStatus } from '@nestjs/common';
import {
    ApiResponse,
    ApiErrorResponse,
    PaginatedResponse,
    ResponseMeta,
    ValidationError
} from '../interfaces/api-response.interface';

export class ResponseUtil {
    /**
     * Success response với data
     */
    static success<T>(
        data: T,
        message: string = 'Operation successful',
        statusCode: number = HttpStatus.OK,
    ): ApiResponse<T> {
        return {
            success: true,
            statusCode,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Success response không có data
     */
    static successNoData(
        message: string = 'Operation successful',
        statusCode: number = HttpStatus.OK,
    ): ApiResponse<null> {
        return {
            success: true,
            statusCode,
            message,
            data: null,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Paginated response
     */
    static paginated<T>(
        items: T[],
        total: number,
        page: number,
        limit: number,
        message: string = 'Data retrieved successfully',
    ): PaginatedResponse<T> {
        // Validate inputs
        page = Math.max(1, Number(page) || 1);
        limit = Math.max(1, Number(limit) || 10);
        total = Math.max(0, Number(total) || 0);

        const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

        const meta: ResponseMeta = {
            page,
            limit,
            total,
            // lastPage: totalPages,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return {
            success: true,
            statusCode: HttpStatus.OK,
            message,
            data: items,
            meta,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Created response (201)
     */
    static created<T>(
        data: T,
        message: string = 'Resource created successfully',
    ): ApiResponse<T> {
        return this.success(data, message, HttpStatus.CREATED);
    }

    /**
     * No content response (204)
     */
    static noContent(message: string = 'No content'): ApiResponse<null> {
        return this.successNoData(message, HttpStatus.NO_CONTENT);
    }

    /**
     * Error response
     */
    static error(
        message: string,
        statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
        error: string = 'Internal Server Error',
        errors?: ValidationError[],
        stack?: string,
    ): ApiErrorResponse {
        return {
            success: false,
            statusCode,
            message,
            error,
            errors,
            timestamp: new Date().toISOString(),
            ...(stack && { stack }), // Only include stack if provided
        };
    }

    /**
     * Bad request response (400)
     */
    static badRequest(
        message: string = 'Bad request',
        errors?: ValidationError[],
    ): ApiErrorResponse {
        return this.error(
            message,
            HttpStatus.BAD_REQUEST,
            'Bad Request',
            errors,
        );
    }

    /**
     * Validation error response (422)
     */
    static validationError(
        errors: ValidationError[],
        message: string = 'Validation failed',
    ): ApiErrorResponse {
        return this.error(
            message,
            HttpStatus.UNPROCESSABLE_ENTITY,
            'Validation Error',
            errors,
        );
    }

    /**
     * Unauthorized response (401)
     */
    static unauthorized(
        message: string = 'Unauthorized',
    ): ApiErrorResponse {
        return this.error(
            message,
            HttpStatus.UNAUTHORIZED,
            'Unauthorized',
        );
    }

    /**
     * Forbidden response (403)
     */
    static forbidden(
        message: string = 'Forbidden resource',
    ): ApiErrorResponse {
        return this.error(
            message,
            HttpStatus.FORBIDDEN,
            'Forbidden',
        );
    }

    /**
     * Not found response (404)
     */
    static notFound(
        message: string = 'Resource not found',
    ): ApiErrorResponse {
        return this.error(
            message,
            HttpStatus.NOT_FOUND,
            'Not Found',
        );
    }

    /**
     * Conflict response (409)
     */
    static conflict(
        message: string = 'Resource already exists',
    ): ApiErrorResponse {
        return this.error(
            message,
            HttpStatus.CONFLICT,
            'Conflict',
        );
    }

    /**
     * Internal server error response (500)
     */
    static internalError(
        message: string = 'Internal server error',
        stack?: string,
    ): ApiErrorResponse {
        return this.error(
            message,
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Internal Server Error',
            undefined,
            stack,
        );
    }
}
