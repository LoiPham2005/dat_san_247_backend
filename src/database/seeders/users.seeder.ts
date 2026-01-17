import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';

@Injectable()
export class UsersSeeder {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) { }

    async seed() {
        const hashedPassword = await bcrypt.hash('Password123@', 10);
        const roles = await this.rolesRepository.find();
        const roleMap = new Map(roles.map((r) => [r.slug, r]));

        const userConfigs = [
            {
                email: 'superadmin@datsan247.com',
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
            console.log(`✅ Seeded ${seededCount} new users (Password: Password123@)`);
        } else {
            console.log('✅ Users already seeded');
        }
    }
}
