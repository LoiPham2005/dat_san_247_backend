// ================================================================
// common/constants/role.constant.ts
// Giữ lại vì: @Roles() decorator, ROLE_PERMISSIONS map
// KHÔNG thể thay bằng Prisma enum
// ================================================================
export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    STAFF = 'staff',
    OWNER = 'owner',
    VENUE_STAFF = 'venue_staff',
    CUSTOMER = 'customer',
}

export enum VenueStaffRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    RECEPTIONIST = 'RECEPTIONIST',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: ['*'],
    [UserRole.ADMIN]: ['*'],
    [UserRole.STAFF]: [
        'users:read',
        'venues:read', 'venues:approve', 'venues:reject',
        'bookings:read',
        'promotions:manage',
        'support:manage',
        'reports:manage',
    ],
    [UserRole.OWNER]: [
        'venues:manage',
        'courts:manage',
        'bookings:read', 'bookings:update',
        'venue-staff:manage',
        'promotions:read',
        'analytics:view',
    ],
    [UserRole.VENUE_STAFF]: [
        'bookings:read', 'bookings:check-in',
        'venues:read-own',
        'addons:manage',
    ],
    [UserRole.CUSTOMER]: [
        'bookings:create', 'bookings:read-own',
        'reviews:create', 'reviews:read-own',
        'support:create',
        'reports:create',
    ],
};