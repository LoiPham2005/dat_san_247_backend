export enum UserRole {
  ADMIN = 'ADMIN',
  ADMIN_STAFF = 'ADMIN_STAFF',
  OWNER = 'OWNER',
  VENUE_STAFF = 'VENUE_STAFF',
  CUSTOMER = 'CUSTOMER'
}

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['*'], // Full access
  [UserRole.ADMIN_STAFF]: [
    'bookings:read',
    'bookings:update',
    'venues:read',
    'users:read'
  ],
  [UserRole.OWNER]: [
    'venues:manage',
    'courts:manage',
    'bookings:read',
    'analytics:view'
  ],
  [UserRole.VENUE_STAFF]: [
    'bookings:read',
    'bookings:update',
    'courts:read'
  ],
  [UserRole.CUSTOMER]: [
    'bookings:create',
    'bookings:read-own',
    'reviews:create'
  ]
};