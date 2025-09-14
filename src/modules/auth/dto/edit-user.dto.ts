import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Gender } from '../entities/user.entity';

export class EditUserDto {
    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    birth_date?: string;
}