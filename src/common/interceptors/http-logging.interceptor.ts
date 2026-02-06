
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { maskSensitiveData } from '../utils/mask.util';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const { method, url, body, query, params, ip } = request;

        // Safe Logging: Remove sensitive data
        const safeBody = maskSensitiveData(body);

        const user = (request as any).user;
        const userId = user ? user.id : 'anonymous';
        const userRole = user ? user.role?.slug || user.role : 'unknown';

        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const delay = Date.now() - now;
                    const statusCode = response.statusCode;

                    this.logger.log({
                        message: `[${method}] ${url} - ${statusCode}`,
                        context: 'HttpRequest',
                        meta: {
                            method,
                            url,
                            userId,
                            userRole,
                            statusCode,
                            delay: `${delay}ms`,
                            ip,
                            // Uncomment to log full body/query (can be noisy)
                            // body: safeBody,
                            // query,
                        },
                    });
                },
                error: (error) => {
                    const delay = Date.now() - now;
                    const statusCode = error.status || 500;

                    this.logger.error({
                        message: `[${method}] ${url} - ${statusCode} - ${error.message}`,
                        context: 'HttpRequest',
                        trace: error.stack,
                        meta: {
                            method,
                            url,
                            userId,
                            userRole,
                            statusCode,
                            delay: `${delay}ms`,
                            ip,
                            body: safeBody, // Often useful to see payload on error
                        },
                    });
                },
            }),
        );
    }
}
