import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from 'src/modules/auth/entities/user.entity';
import { Role } from 'src/modules/auth/enums/role.enum';
import { Gender } from 'src/modules/auth/enums/gender.enums';

@Injectable()
export class DataInitService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async onApplicationBootstrap() {
        const count = await this.userRepository.count();
        if (count === 0) {
            try {
                // Hash mật khẩu bằng argon2id
                const adminPassword = await argon2.hash('admin123', {
                    type: argon2.argon2id,
                });

                // Tạo admin
                await this.userRepository.save({
                    fullname: "Admin",
                    username: 'admin',
                    email: 'admin@example.com',
                    password: adminPassword,
                    role: Role.ADMIN,
                    status: true,
                });

                // Tạo 2 users mẫu
                const userPassword = await argon2.hash('user123', {
                    type: argon2.argon2id,
                });

                await this.userRepository.save([
                    {
                        fullname: "User One",
                        username: 'user1',
                        email: 'user1@example.com',
                        password: userPassword,
                        phone: '0123456789',
                        gender: Gender.MALE,
                        birthDate: new Date('1990-01-01'),
                        role: Role.USER,
                        is_active: true,
                    },
                    {
                        fullname: "User Two",
                        username: 'user2',
                        email: 'user2@example.com',
                        password: userPassword,
                        phone: '0987654321',
                        gender: Gender.FEMALE,
                        birthDate: new Date('1995-01-01'),
                        role: Role.USER,
                        is_active: true,
                    },
                ]);

                console.log('✅ Đã khởi tạo dữ liệu mẫu thành công (argon2id)!');
            } catch (error) {
                console.error('❌ Lỗi khởi tạo dữ liệu:', error);
            }
        }
    }
}
