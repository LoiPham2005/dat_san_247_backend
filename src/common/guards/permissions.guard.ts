import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
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

        // Nếu API không yêu cầu permissions → bỏ qua check
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Dựa trên JWT payload (JwtPayload) → user.permissions: string[]
        const userPermissions = user?.permissions || [];

        // Check platform-wide admin hoặc super_admin có quyền "*"
        if (userPermissions.includes('*')) {
            return true;
        }

        const hasPermission = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('Required permissions not met: ' + requiredPermissions.join(', '));
        }

        return true;
    }
}
