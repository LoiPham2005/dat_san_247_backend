import { HttpStatus } from '@nestjs/common';
import { ApiResponse, PaginatedResponse, ResponseMeta } from '../interfaces/api-response.interface';

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
            path: '', // Sẽ được set bởi interceptor
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
            path: '',
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
    ): ApiResponse<PaginatedResponse<T>> {
        const totalPages = Math.ceil(total / limit);

        const meta: ResponseMeta = {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };

        return {
            success: true,
            statusCode: HttpStatus.OK,
            message,
            data: {
                items,
                meta,
            },
            meta,
            timestamp: new Date().toISOString(),
            path: '',
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
}
