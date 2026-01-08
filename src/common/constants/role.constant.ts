export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ADMIN_STAFF = 'ADMIN_STAFF',
  OWNER = 'OWNER',
  VENUE_STAFF = 'VENUE_STAFF',
  CUSTOMER = 'CUSTOMER'
}

export const ROLE_PERMISSIONS = {
    [UserRole.SUPER_ADMIN]: ['all'],  
    [UserRole.ADMIN]: ['all'],
    [UserRole.OWNER]: ['manage_venue', 'manage_staff', 'view_analytics'],
    [UserRole.VENUE_STAFF]: ['check_in', 'view_bookings'],
    [UserRole.CUSTOMER]: ['book_venue', 'view_profile'],

};