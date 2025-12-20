// modules/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.findById(id);

    const isValidPassword = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.userRepository.save(user);
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    await this.userRepository.update(userId, { fcmToken });
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.userRepository.update(userId, { emailVerified: true });
  }

  async verifyPhone(userId: string): Promise<void> {
    await this.userRepository.update(userId, { phoneVerified: true });
  }
}
