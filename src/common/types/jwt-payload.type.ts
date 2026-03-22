export type JwtPayload = {
    sub: string;     // userId
    email: string;
    role: string;    // platform role slug (e.g., 'super_admin', 'admin', 'customer')
    permissions: string[]; // platform-level permissions (e.g., ['users:read', 'venues:manage'])
    is_venue_staff?: boolean; // Thêm field này
};
