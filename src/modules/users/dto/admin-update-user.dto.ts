import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserStatus, KycStatus } from '@prisma/client';

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
    @IsEnum(KycStatus)
    kyc_status?: KycStatus;

    @IsOptional()
    @IsBoolean()
    is_email_verified?: boolean;

    @IsOptional()
    @IsString()
    role_id?: string;
}
