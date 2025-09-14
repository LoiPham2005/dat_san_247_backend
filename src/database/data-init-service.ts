import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from 'src/modules/auth/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Gender } from '../modules/auth/entities/user.entity';
import { RoleType } from '../modules/roles/entities/role.entity';

@Injectable()
export class DataInitService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
    ) { }

    private async createRoleIfNotExists(name: RoleType, description: string): Promise<Role> {
        let role = await this.roleRepository.findOne({
            where: { name }
        });
        if (!role) {
            role = this.roleRepository.create({ name, description });
            role = await this.roleRepository.save(role);
        }
        return role;
    }

    async onApplicationBootstrap() {
        // Tạo roles trước
        const adminRole = await this.createRoleIfNotExists(RoleType.ADMIN, 'Administrator with full access');
        const customerRole = await this.createRoleIfNotExists(RoleType.CUSTOMER, 'Regular customer');
        const ownerRole = await this.createRoleIfNotExists(RoleType.VENUE_OWNER, 'Venue owner/manager');

        // Kiểm tra và tạo users
        const count = await this.userRepository.count();
        if (count === 0) {
            try {
                const adminPassword = await argon2.hash('admin123', {
                    type: argon2.argon2id,
                });

                // Tạo admin với role_id
                await this.userRepository.save({
                    fullname: "Admin",
                    username: 'admin',
                    email: 'admin@example.com',
                    password: adminPassword,
                    roleId: adminRole.roleId,
                    isActive: true,
                });

                const userPassword = await argon2.hash('user123', {
                    type: argon2.argon2id,
                });

                // Tạo users với role_id
                await this.userRepository.save([
                    {
                        fullname: "User One",
                        username: 'user1',
                        email: 'user1@example.com',
                        password: userPassword,
                        phone: '0123456789',
                        gender: Gender.MALE,
                        birthDate: new Date('1990-01-01'),
                        roleId: customerRole.roleId,
                        isActive: true,
                    },
                    {
                        fullname: "User Two",
                        username: 'user2',
                        email: 'user2@example.com',
                        password: userPassword,
                        phone: '0987654321',
                        gender: Gender.FEMALE,
                        birthDate: new Date('1995-01-01'),
                        roleId: customerRole.roleId,
                        isActive: true,
                    },
                ]);

                console.log('✅ Đã khởi tạo dữ liệu mẫu thành công!');
            } catch (error) {
                console.error('❌ Lỗi khởi tạo dữ liệu:', error);
            }
        }
    }
}
