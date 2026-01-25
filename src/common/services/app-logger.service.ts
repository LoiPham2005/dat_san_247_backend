import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements NestLoggerService {
    private context?: string;

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) { }

    setContext(context: string) {
        this.context = context;
    }

    log(message: any, context?: string): void {
        this.logger.info(message, { context: context || this.context });
    }

    error(message: any, trace?: string, context?: string): void {
        this.logger.error(message, {
            context: context || this.context,
            trace,
        });
    }

    warn(message: any, context?: string): void {
        this.logger.warn(message, { context: context || this.context });
    }

    debug(message: any, context?: string): void {
        this.logger.debug(message, { context: context || this.context });
    }

    verbose(message: any, context?: string): void {
        this.logger.verbose(message, { context: context || this.context });
    }

    // Custom methods for structured logging
    logActivity(data: {
        action: string;
        userId?: string;
        entityType?: string;
        entityId?: string;
        metadata?: Record<string, any>;
    }) {
        this.logger.info('Activity', {
            context: this.context || 'Activity',
            ...data,
        });
    }

    logRequest(data: {
        method: string;
        path: string;
        statusCode: number;
        duration: number;
        userId?: string;
        ip?: string;
    }) {
        const level = data.statusCode >= 400 ? 'warn' : 'info';
        this.logger.log(level, `${data.method} ${data.path} ${data.statusCode} - ${data.duration}ms`, {
            context: 'HTTP',
            ...data,
        });
    }

    logSecurity(data: {
        event: string;
        userId?: string;
        ip?: string;
        userAgent?: string;
        details?: string;
    }) {
        this.logger.warn('Security Event', {
            context: 'Security',
            ...data,
        });
    }
}
