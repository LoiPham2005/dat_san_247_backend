import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { OtpType } from '@prisma/client';

export class VerifyOtpDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsEnum(OtpType)
    type: OtpType;
}
