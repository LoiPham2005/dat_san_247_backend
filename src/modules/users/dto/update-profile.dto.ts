import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

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
    date_of_birth?: string; // ISO string

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
