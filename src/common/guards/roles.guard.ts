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
        // Dựa trên JWT payload (JwtPayload)
        const userRole = user?.role;
        const isVenueStaff = user?.is_venue_staff === true;

        if (!userRole) {
            throw new ForbiddenException('User session does not have a role. Please login again');
        }

        // Tạo danh sách role hiệu quả (Nếu isVenueStaff = true thì thêm role venue_staff)
        const userRoles: string[] = [userRole];
        if (isVenueStaff && !userRoles.includes(UserRole.VENUE_STAFF)) {
            userRoles.push(UserRole.VENUE_STAFF);
        }

        const hasRole = requiredRoles.some(role => userRoles.includes(role));
        if (!hasRole) {
            throw new ForbiddenException('You do not have permission to access this resource (Required: ' + requiredRoles.join('|') + ')');
        }

        return true;
    }
}
