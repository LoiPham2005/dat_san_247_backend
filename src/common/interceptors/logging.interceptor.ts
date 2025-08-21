import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Log request thành công
          this.logger.log(`${method} ${url} - ${Date.now() - now}ms`);
        },
        error: (err) => {
          // Log lỗi xảy ra
          const status = err?.status || 500;
          const message = err?.message || 'Internal Server Error';
          this.logger.error(
            `${method} ${url} - ${Date.now() - now}ms - status: ${status} - message: ${message}`,
          );
        },
      }),
    );
  }
}
