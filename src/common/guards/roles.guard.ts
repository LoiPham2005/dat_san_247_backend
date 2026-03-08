import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../constants/role.constant';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Nếu API không yêu cầu role cụ thể → bỏ qua check
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Kiểm tra user model có role property hay không
        // Giả sử user.role_slug hoặc user.role.slug hoặc user.role
        // Dựa trên JWT payload (JwtPayload)
        const userRole = user?.role;

        if (!userRole) {
            throw new ForbiddenException('User session does not have a role. Please login again');
        }

        const hasRole = requiredRoles.includes(userRole);
        if (!hasRole) {
            throw new ForbiddenException('You do not have permission to access this resource (Required: ' + requiredRoles.join('|') + ')');
        }

        return true;
    }
}
