import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from 'src/modules/auth/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Gender } from '../modules/auth/entities/user.entity';
import { RoleType } from '../modules/roles/entities/role.entity';

@Injectable()
export class DataInitService implements OnApplicationBootstrap {
    private readonly logger = new Logger(DataInitService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
    ) { }

    async onApplicationBootstrap() {
        await this.seedRoles();
        await this.seedUsers();
    }

    private async seedRoles() {
        try {
            const count = await this.roleRepository.count();
            if (count > 0) {
                this.logger.log('Roles đã tồn tại, bỏ qua seeding...');
                return;
            }

            const roles = [
                {
                    name: RoleType.ADMIN,
                    description: 'Quản trị viên hệ thống với toàn quyền truy cập'
                },
                {
                    name: RoleType.SUB_ADMIN,
                    description: 'Quản trị viên khu vực / phụ' 
                },
                {
                    name: RoleType.MODERATOR,
                    description: 'Kiểm duyệt nội dung, duyệt sân'
                },
                {
                    name: RoleType.SUPPORT,
                    description: 'CSKH / hỗ trợ'
                },
                {
                    name: RoleType.VENUE_OWNER,
                    description: 'Chủ sân'
                },
                {
                    name: RoleType.PARTNER,
                    description: 'Đối tác dịch vụ (ăn uống, vận chuyển…)'
                },
                {
                    name: RoleType.CUSTOMER,
                    description: 'Khách hàng cuối'
                }
            ];

            const savedRoles = await Promise.all(
                roles.map(role => this.roleRepository.save(this.roleRepository.create(role)))
            );

            this.logger.log('✅ Khởi tạo roles thành công!');
            return savedRoles;
        } catch (error) {
            this.logger.error('❌ Lỗi khởi tạo roles:', error);
            throw error;
        }
    }

    private async seedUsers() {
        try {
            const count = await this.userRepository.count();
            if (count > 0) {
                this.logger.log('Users đã tồn tại, bỏ qua seeding...');
                return;
            }

            // Get roles
            const adminRole = await this.roleRepository.findOne({ where: { name: RoleType.ADMIN }});
            const customerRole = await this.roleRepository.findOne({ where: { name: RoleType.CUSTOMER }});
            const ownerRole = await this.roleRepository.findOne({ where: { name: RoleType.VENUE_OWNER }});

            if (!adminRole || !customerRole || !ownerRole) {
                throw new Error('Không tìm thấy roles cần thiết');
            }

            const users = [
                {
                    fullname: "Admin User",
                    username: 'admin',
                    email: 'admin@example.com',
                    password: await argon2.hash('admin123'),
                    roleId: adminRole.roleId,
                    isActive: true
                },
                {
                    fullname: "Test Customer 1",
                    username: 'customer1',
                    email: 'customer1@example.com',
                    password: await argon2.hash('customer123'),
                    phone: '0123456789',
                    gender: Gender.MALE,
                    birthDate: new Date('1990-01-01'),
                    roleId: customerRole.roleId,
                    isActive: true
                },
                {
                    fullname: "Test Customer 2",
                    username: 'customer2', 
                    email: 'customer2@example.com',
                    password: await argon2.hash('customer123'),
                    phone: '0987654321',
                    gender: Gender.FEMALE,
                    birthDate: new Date('1995-01-01'),
                    roleId: customerRole.roleId,
                    isActive: true
                },
                {
                    fullname: "Test Venue Owner",
                    username: 'owner1',
                    email: 'owner@example.com',
                    password: await argon2.hash('owner123'),
                    phone: '0369852147',
                    gender: Gender.MALE,
                    birthDate: new Date('1985-01-01'),
                    roleId: ownerRole.roleId,
                    isActive: true
                }
            ];

            await this.userRepository.save(users);
            this.logger.log('✅ Khởi tạo users thành công!');

        } catch (error) {
            this.logger.error('❌ Lỗi khởi tạo users:', error);
            throw error;
        }
    }
}
