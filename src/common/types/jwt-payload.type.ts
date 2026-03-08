export type JwtPayload = {
    sub: string; // userId
    email: string;
    role: string; // role slug (e.g., 'super_admin', 'admin', 'customer')
};
