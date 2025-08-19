import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Sex } from '../../roles/role.enum';

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
    @IsEnum(Sex)
    sex?: Sex;

    @IsOptional()
    @IsString()
    birth_date?: string;
}