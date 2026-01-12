export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  STAFF = 'staff',  
  OWNER = 'owner',  
  VENUE_STAFF = 'venue-staff',
  CUSTOMER = 'customer'
}

export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: ['*'],
  [UserRole.STAFF]: [
    'users:read',
    'bookings:read',
    'bookings:check-in',
    'courts:read',
    'venues:read',
    'promotions:manage'
  ],
  [UserRole.OWNER]: [
    'venues:manage',
    'courts:create', 'courts:read', 'courts:update', 'courts:delete',
    'bookings:read', 'bookings:update',
    'analytics:view',
    'users:read',
    'promotions:manage'
  ],
  [UserRole.VENUE_STAFF]: [
    'bookings:read',
    'bookings:check-in',
    'courts:read'
  ],
  [UserRole.CUSTOMER]: [
    'reviews:create',
    'bookings:create',
    'bookings:read-own'
  ],
};