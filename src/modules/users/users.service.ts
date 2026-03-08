import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpsertSportPreferenceDto } from './dto/upsert-sport-preference.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            include: {
                role: true,
                profile: {
                    include: { sport_preferences: true }
                }
            }
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.users.findUnique({
            where: { email },
            include: { role: true }
        });
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const { full_name, avatar_url, gender, date_of_birth, ...profileData } = dto;

        return this.prisma.$transaction(async (tx) => {
            // Cập nhật bảng users
            await tx.users.update({
                where: { id: userId },
                data: {
                    full_name,
                    avatar_url,
                    gender,
                    date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined
                }
            });

            // Cập nhật bảng user_profiles
            return tx.user_profiles.update({
                where: { user_id: userId },
                data: profileData
            });
        });
    }

    async updatePassword(userId: string, dto: UpdatePasswordDto) {
        const user = await this.prisma.users.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const isMatch = await argon2.verify(user.password, dto.old_password);
        if (!isMatch) throw new BadRequestException('Old password does not match');

        const hashedPassword = await argon2.hash(dto.new_password);
        await this.prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return { success: true, message: 'Password updated successfully' };
    }

    async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
        return this.prisma.user_profiles.update({
            where: { user_id: userId },
            data: dto
        });
    }

    async upsertSportPreference(userId: string, dto: UpsertSportPreferenceDto) {
        const profile = await this.prisma.user_profiles.findUnique({ where: { user_id: userId } });
        if (!profile) throw new NotFoundException('User profile not found');

        return this.prisma.user_sport_preferences.upsert({
            where: {
                user_profile_id_sport_type: {
                    user_profile_id: profile.id,
                    sport_type: dto.sport_type
                }
            },
            update: { skill_level: dto.skill_level },
            create: {
                user_profile_id: profile.id,
                sport_type: dto.sport_type,
                skill_level: dto.skill_level
            }
        });
    }
}
