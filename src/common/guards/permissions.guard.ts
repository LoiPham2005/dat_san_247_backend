import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true; // No permissions required
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        if (!user.role) {
            throw new ForbiddenException('User has no role assigned');
        }

        // Check if user's role has the required permissions
        const userPermissions = user.role.permissions?.map((p) => p.slug) || [];

        // Check for wildcard permission (super admin)
        if (userPermissions.includes('*')) {
            return true;
        }

        // Check if user has ALL required permissions
        const hasAllPermissions = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException(
                `You do not have the required permissions: ${requiredPermissions.join(', ')}`,
            );
        }

        return true;
    }
}
