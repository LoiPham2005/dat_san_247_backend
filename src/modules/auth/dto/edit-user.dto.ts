import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Gender } from 'src/modules/auth/enums/gender.enums';

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