import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../common/constants/role.constant';

@Injectable()
export class RolesSeeder {
    private readonly logger = new Logger(RolesSeeder.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed() {
        const roles = [
            {
                name: 'Super Admin',
                slug: UserRole.SUPER_ADMIN,
                description: 'Highest platform authority',
                is_system: true,
            },
            {
                name: 'Admin',
                slug: UserRole.ADMIN,
                description: 'System administrator',
                is_system: true,
            },
            {
                name: 'Staff',
                slug: UserRole.STAFF,
                description: 'Platform operation staff',
                is_system: true,
            },
            {
                name: 'Venue Owner',
                slug: UserRole.OWNER,
                description: 'Owner of sports venues',
                is_system: true,
            },
            {
                name: 'Customer',
                slug: UserRole.CUSTOMER,
                description: 'End user / player',
                is_system: true,
            },
        ];

        for (const role of roles) {
            await this.prisma.roles.upsert({
                where: { slug: role.slug },
                update: {},
                create: role,
            });
        }

        this.logger.log('Roles seeded successfully');
    }
}
