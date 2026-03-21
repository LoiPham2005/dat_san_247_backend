import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class AdminCreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    full_name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsBoolean()
    is_email_verified?: boolean;

    @IsString()
    role_id: string;
}
