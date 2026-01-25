import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../constants/role.constant';
import { AppLoggerService } from '../services/app-logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly logger: AppLoggerService
    ) {
        this.logger.setContext('RolesGuard');
    }

    canActivate(context: ExecutionContext): boolean {

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            this.logger.warn(`No user found in request headers: ${JSON.stringify(context.switchToHttp().getRequest().headers)}`);
            throw new ForbiddenException('User not found in request');
        }

        const userRole = typeof user.role === 'object' ? user.role?.slug : user.role;
        // this.logger.debug(`Checking roles: Required=[${requiredRoles.join(', ')}], User=${userRole}`);

        const hasRole = requiredRoles.some((role) => userRole === role);
        if (!hasRole) {
            this.logger.warn(`Forbidden: User ${user.email} with role ${userRole} tried to access ${context.getClass().name}`);
            throw new ForbiddenException('You do not have permission to access this resource');
        }
        return true;
    }
}
