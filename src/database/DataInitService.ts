import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/common/enums/role.enum';
import { Sex } from 'src/modules/common/enums/sex.enums';

@Injectable()
export class DataInitService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
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
                        username: 'user1',
                        email: 'user1@example.com',
                        password: userPassword,
                        phone: '0123456789',
                        sex: Sex.MALE,
                        birth_date: '1990-01-01',
                        role: Role.USER,
                        status: true,
                    },
                    {
                        username: 'user2',
                        email: 'user2@example.com',
                        password: userPassword,
                        phone: '0987654321',
                        sex: Sex.FEMALE,
                        birth_date: '1995-01-01',
                        role: Role.USER,
                        status: true,
                    },
                ]);

                console.log('✅ Đã khởi tạo dữ liệu mẫu thành công (argon2id)!');
            } catch (error) {
                console.error('❌ Lỗi khởi tạo dữ liệu:', error);
            }
        }
    }
}
