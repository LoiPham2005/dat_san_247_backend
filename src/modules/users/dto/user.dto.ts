import { IsEmail, IsString, IsOptional, IsEnum, IsArray, IsInt, Min, Max, IsBoolean, IsNotEmpty } from 'class-validator';
import { UserStatus, Gender } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * DTO cho Admin cập nhật user bất kỳ
 */
export class AdminUpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    full_name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsBoolean()
    is_email_verified?: boolean;

    @IsOptional()
    @IsString()
    role_id?: string;
}

/**
 * DTO cho truy vấn danh sách users (Admin)
 */
export class QueryUsersDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsString()
    role_id?: string;
}

/**
 * DTO cập nhật profile (Me)
 */
export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    full_name?: string;

    @IsOptional()
    @IsString()
    avatar_url?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    date_of_birth?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    district?: string;
}

/**
 * DTO cập nhật password (Me)
 */
export class UpdatePasswordDto {
    @IsNotEmpty()
    @IsString()
    old_password: string;

    @IsNotEmpty()
    @IsString()
    new_password: string;
}

/**
 * DTO cập nhật cài đặt thông báo (Me)
 */
export class UpdateNotificationSettingsDto {
    @IsOptional()
    @IsBoolean()
    notif_push?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_email?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_sms?: boolean;

    @IsOptional()
    @IsBoolean()
    notif_booking?: boolean;
}

/**
 * DTO cập nhật sở thích môn thể thao
 */
export class UpsertSportPreferenceDto {
    @IsNotEmpty()
    @IsString()
    sport_type: string;

    @IsInt()
    @Min(1)
    @Max(5)
    skill_level: number;
}
