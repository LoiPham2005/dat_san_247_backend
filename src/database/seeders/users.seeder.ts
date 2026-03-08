import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../common/constants/role.constant';

@Injectable()
export class UsersSeeder {
    private readonly logger = new Logger(UsersSeeder.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed() {
        const adminRole = await this.prisma.roles.findUnique({
            where: { slug: UserRole.SUPER_ADMIN },
        });

        if (!adminRole) {
            this.logger.error('Super Admin role not found. Please seed roles first.');
            return;
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const adminUser = {
            email: 'admin@datsan247.vn',
            password: hashedPassword,
            full_name: 'System Administrator',
            phone: '0987654321',
            role_id: adminRole.id,
            is_email_verified: true,
            status: 'ACTIVE' as any,
        };

        await this.prisma.users.upsert({
            where: { email: adminUser.email },
            update: {},
            create: adminUser,
        });

        this.logger.log('Default Admin user seeded successfully');
    }
}
