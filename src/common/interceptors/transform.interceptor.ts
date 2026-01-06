import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const request = context.switchToHttp().getRequest();
        const statusCode = context.switchToHttp().getResponse().statusCode;

        return next.handle().pipe(
            map((data) => {
                // Nếu data đã có format chuẩn (từ service), giữ nguyên
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // Transform thành format chuẩn
                return {
                    success: true,
                    statusCode,
                    message: this.getDefaultMessage(request.method, statusCode),
                    data: data || null,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
            }),
        );
    }

    private getDefaultMessage(method: string, statusCode: number): string {
        const messages: Record<string, Record<number, string>> = {
            GET: { 200: 'Data retrieved successfully' },
            POST: { 201: 'Resource created successfully', 200: 'Operation successful' },
            PATCH: { 200: 'Resource updated successfully' },
            PUT: { 200: 'Resource updated successfully' },
            DELETE: { 200: 'Resource deleted successfully' },
        };

        return messages[method]?.[statusCode] || 'Operation successful';
    }
}
