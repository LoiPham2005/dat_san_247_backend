import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { logger } from '@sentry/nestjs';

@Injectable()
export class UsersSeeder {
    constructor(private prisma: PrismaService) { }

    async seed() {
        const hashedPassword = await argon2.hash('123456', { type: argon2.argon2id });
        const roles = await this.prisma.roles.findMany();
        const roleMap = new Map(roles.map((r) => [r.slug, r]));

        const userConfigs = [
            {
                email: 'superadmin@test.com',
                password: hashedPassword,
                full_name: 'Super Admin',
                phone: '0900000000',
                role_id: roleMap.get('super-admin')?.id,
                status: 'ACTIVE',
                is_email_verified: true,
            },
            {
                email: 'admin@test.com',
                password: hashedPassword,
                full_name: 'Test Admin',
                phone: '0910000000',
                role_id: roleMap.get('admin')?.id,
                status: 'ACTIVE',
                is_email_verified: true,
            },
            {
                email: 'owner@test.com',
                password: hashedPassword,
                full_name: 'Test Owner',
                phone: '0911111111',
                role_id: roleMap.get('owner')?.id,
                status: 'ACTIVE',
                is_email_verified: true,
            },
            {
                email: 'staff@test.com',
                password: hashedPassword,
                full_name: 'System Staff',
                phone: '0920000000',
                role_id: roleMap.get('staff')?.id,
                status: 'ACTIVE',
                is_email_verified: true,
            },
            {
                email: 'venuestaff@test.com',
                password: hashedPassword,
                full_name: 'Venue Staff',
                phone: '0922222222',
                role_id: roleMap.get('venue-staff')?.id,
                status: 'ACTIVE',
                is_email_verified: true,
            },
            {
                email: 'customer@test.com',
                password: hashedPassword,
                full_name: 'Test Customer',
                phone: '0933333333',
                role_id: roleMap.get('customer')?.id,
                status: 'ACTIVE',
                is_email_verified: true,
            },
        ];

        let seededCount = 0;
        for (const config of userConfigs) {
            const existing = await this.prisma.users.findUnique({ where: { email: config.email } });
            if (!existing) {
                await this.prisma.users.create({ data: config as any });
                seededCount++;
            }
        }

        if (seededCount > 0) {
            logger.info(
                `✅ Seeded ${seededCount} users successfully (default password set via seeder)`
            );
        } else {
            logger.info('✅ Users already seeded');
        }
    }
}

