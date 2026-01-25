import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppLoggerService } from '../services/app-logger.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly logger: AppLoggerService) {
        super();
        this.logger.setContext('JwtAuthGuard');
    }

    canActivate(context: ExecutionContext) {
        // this.logger.debug('Checking authentication...');
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            this.logger.warn(`Authentication failed: ${info?.message || 'No user found'}. Info: ${JSON.stringify(info)}`);
            throw err || new UnauthorizedException('Token is invalid or expired');
        }
        return user;
    }
}
