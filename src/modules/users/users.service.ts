import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { UserNotFoundException } from 'src/common/exceptions/custom-exceptions';
import { Sex } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async findAll() {
        return this.userRepository.find({
            select: [
                'id', 'avatar', 'username', 'email', 'phone',
                'sex', 'birthDate', 'role', 'status',
                'createdAt', 'updatedAt'
            ]
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new UserNotFoundException(id.toString());
        return user;
    }

    async create(data: {
        username: string;
        email: string;
        password: string;
        avatar?: string;
        phone?: string;
        sex?: Sex;
        birth_date?: string;
        role?: string;
        status?: boolean;
        provider?: string;
        providerId?: string;
    }): Promise<User> {
        const exists = await this.findByEmail(data.email);
        if (exists) throw new BadRequestException('Email đã tồn tại');

        const userData = {
            ...data,
            birthDate: data.birth_date ? new Date(data.birth_date) : undefined
        };
        delete userData.birth_date;

        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async update(id: number, data: EditUserDto): Promise<Partial<User>> {
        const user = await this.findById(id);

        const updateData = {
            ...user,
            ...data,
            sex: data.sex ? data.sex as Sex : user.sex,
            birthDate: data.birth_date ? new Date(data.birth_date) : user.birthDate
        };

        const updatedUser = await this.userRepository.save(updateData);
        const { password, refreshTokens, ...result } = updatedUser;
        return result;
    }

    async changePassword(id: number, { oldPassword, newPassword }: ChangePasswordDto) {
        const user = await this.findById(id);

        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) throw new BadRequestException('Mật khẩu cũ không đúng');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(id, { password: hashedPassword });

        return { message: 'Đổi mật khẩu thành công' };
    }

    async updateRefreshToken(id: number, refreshToken: string | null) {
        const updateData: Partial<User> = {};

        if (!refreshToken) {
            // Clear refresh tokens
            await this.userRepository
                .createQueryBuilder()
                .relation(User, "refreshTokens")
                .of(id)
                .set([]);
        }

        await this.userRepository.update(id, updateData);
    }

    async clearRefreshToken(id: number) {
        await this.userRepository
            .createQueryBuilder()
            .relation(User, "refreshTokens")
            .of(id)
            .set([]);

        return { message: 'Đăng xuất thành công' };
    }

    async findAdmin(): Promise<User> {
        const admin = await this.userRepository.findOne({
            where: { role: 'ADMIN' }
        });
        if (!admin) throw new NotFoundException('Không tìm thấy tài khoản admin');
        return admin;
    }

    async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: [
                { username },
                { email }
            ]
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { username }
        });
    }

    async findOne(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id }
        });
    }

    async updatePassword(id: number, hashedPassword: string) {
        await this.userRepository.update(id, {
            password: hashedPassword
        });
    }
}