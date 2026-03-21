import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../common/constants/role.constant';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersSeeder {
    private readonly logger = new Logger(UsersSeeder.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed() {
        // Lấy tất cả roles để gán ID
        const allRoles = await this.prisma.roles.findMany();
        const roleMap = allRoles.reduce((acc, role) => {
            acc[role.slug] = role.id;
            return acc;
        }, {} as Record<string, string>);

        const defaultPassword = await argon2.hash('123456');

        const testUsers = [
            {
                email: 'superadmin@datsan247.vn',
                password: defaultPassword,
                full_name: 'Super Administrator',
                phone: '0900000001',
                role_slug: UserRole.SUPER_ADMIN,
            },
            {
                email: 'admin@datsan247.vn',
                password: defaultPassword,
                full_name: 'Admin User',
                phone: '0900000002',
                role_slug: UserRole.ADMIN,
            },
            {
                email: 'staff@datsan247.vn',
                password: defaultPassword,
                full_name: 'Platform Staff',
                phone: '0900000003',
                role_slug: UserRole.STAFF,
            },
            {
                email: 'owner@datsan247.vn',
                password: defaultPassword,
                full_name: 'Venue Owner',
                phone: '0900000004',
                role_slug: UserRole.OWNER,
            },
            {
                email: 'venuestaff@datsan247.vn',
                password: defaultPassword,
                full_name: 'Venue Staff',
                phone: '0900000005',
                role_slug: UserRole.VENUE_STAFF,
            },
            {
                email: 'customer@datsan247.vn',
                password: defaultPassword,
                full_name: 'Test Customer',
                phone: '0900000006',
                role_slug: UserRole.CUSTOMER,
            },
        ];

        for (const u of testUsers) {
            const roleId = roleMap[u.role_slug];
            if (!roleId) {
                this.logger.warn(`Role ${u.role_slug} not found, skipping user ${u.email}`);
                continue;
            }

            const { role_slug, ...userData } = u;
            
            await this.prisma.users.upsert({
                where: { email: u.email },
                update: {},
                create: {
                    ...userData,
                    role_id: roleId,
                    is_email_verified: true,
                    status: UserStatus.ACTIVE,
                    profile: { create: {} }, // Tự động tạo profile trống
                },
            });
        }

        this.logger.log('Test users (6 roles) seeded successfully with password 123456');
    }
}
