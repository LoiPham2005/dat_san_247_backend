import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

// Define static messages to avoid recreation
const DEFAULT_MESSAGES: Record<string, Record<number, string>> = {
    GET: { 200: 'Data retrieved successfully' },
    POST: { 201: 'Resource created successfully', 200: 'Operation successful' },
    PATCH: { 200: 'Resource updated successfully' },
    PUT: { 200: 'Resource updated successfully' },
    DELETE: { 200: 'Resource deleted successfully' },
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    constructor(private reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const response = httpContext.getResponse();
        const statusCode = response.statusCode;

        // Get custom message from decorator
        const customMessage = this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        return next.handle().pipe(
            map((data) => {
                const standardizedResponse = data && typeof data === 'object' && 'success' in data;

                if (standardizedResponse) {
                    return {
                        ...data,
                        path: data.path || request.url,
                    };
                }

                return {
                    success: true,
                    statusCode,
                    message: customMessage || this.getDefaultMessage(request.method, statusCode),
                    data: data || null,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
            }),
        );
    }

    private getDefaultMessage(method: string, statusCode: number): string {
        return DEFAULT_MESSAGES[method]?.[statusCode] || 'Operation successful';
    }
}
