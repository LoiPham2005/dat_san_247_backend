import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { AUDIT_KEY } from '../decorators/audit.decorator'; // Sẽ tạo sau
import { ActivityType } from '../constants/activity.constant';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);

    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { user, method, url, ip, body } = request;
        const userAgent = request.get('user-agent');

        // Lấy action type từ decorator @Audit()
        const auditAction = this.reflector.get<ActivityType>(
            AUDIT_KEY,
            context.getHandler(),
        );

        // Nếu không có decorator @Audit, bỏ qua không log vào DB (hoặc log tùy ý)
        if (!auditAction) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(async (response) => {
                // Log thành công
                await this.saveLog({
                    user_id: user?.id,
                    action: auditAction,
                    resource: url,
                    new_values: this.filterSensitiveData(body),
                    ip_address: ip,
                    user_agent: userAgent,
                    status: 'success',
                });
            }),
            catchError((err) => {
                // Log thất bại
                this.saveLog({
                    user_id: user?.id,
                    action: auditAction,
                    resource: url,
                    new_values: this.filterSensitiveData(body),
                    ip_address: ip,
                    user_agent: userAgent,
                    status: 'failed',
                    error_message: err.message,
                }).catch((e) => this.logger.error('Failed to save audit log', e));

                return throwError(() => err);
            }),
        );
    }

    private async saveLog(data: any) {
        try {
            await this.prisma.audit_logs.create({
                data: {
                    ...data,
                    // Đảm bảo không ghi đè các giá trị null vào DB nếu không cần
                    user_id: data.user_id || null,
                },
            });
        } catch (error) {
            this.logger.error('Error saving audit log to database', error.stack);
        }
    }

    // Loại bỏ các trường nhạy cảm như password trước khi log
    private filterSensitiveData(data: any) {
        if (!data) return null;
        const sensitiveKeys = ['password', 'oldPassword', 'newPassword', 'token', 'refreshToken'];
        const filtered = { ...data };
        sensitiveKeys.forEach((key) => {
            if (key in filtered) filtered[key] = '***';
        });
        return filtered;
    }
}
