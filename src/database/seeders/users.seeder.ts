import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { logger } from '@sentry/nestjs';

@Injectable()
export class UsersSeeder {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) { }

    async seed() {
        // const hashedPassword = await bcrypt.hash('123456', 10);
        const hashedPassword = await argon2.hash('123456', { type: argon2.argon2id });
        const roles = await this.rolesRepository.find();
        const roleMap = new Map(roles.map((r) => [r.slug, r]));

        const userConfigs = [
            {
                email: 'superadmin@test.com',
                password: hashedPassword,
                fullName: 'Super Admin',
                phone: '0900000000',
                role: roleMap.get('super-admin'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'admin@test.com',
                password: hashedPassword,
                fullName: 'Test Admin',
                phone: '0910000000',
                role: roleMap.get('admin'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'owner@test.com',
                password: hashedPassword,
                fullName: 'Test Owner',
                phone: '0911111111',
                role: roleMap.get('owner'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'staff@test.com',
                password: hashedPassword,
                fullName: 'System Staff',
                phone: '0920000000',
                role: roleMap.get('staff'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'venuestaff@test.com',
                password: hashedPassword,
                fullName: 'Venue Staff',
                phone: '0922222222',
                role: roleMap.get('venue-staff'),
                isActive: true,
                isVerified: true,
            },
            {
                email: 'customer@test.com',
                password: hashedPassword,
                fullName: 'Test Customer',
                phone: '0933333333',
                role: roleMap.get('customer'),
                isActive: true,
                isVerified: true,
            },
        ];

        let seededCount = 0;
        for (const config of userConfigs) {
            const existing = await this.usersRepository.findOne({ where: { email: config.email } });
            if (!existing) {
                const user = this.usersRepository.create(config);
                await this.usersRepository.save(user);
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
